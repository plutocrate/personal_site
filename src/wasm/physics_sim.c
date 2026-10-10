// =============================================================================
// Raylib-Compatible C Physics Engine (Compiled to WebAssembly)
// Author: Pratham Purohit
// Features: Multi-type projectile dynamics, ballistic drag, elastic restitution,
//           AABB and sphere collision resolution, and particle bursts.
// =============================================================================

#define MAX_PROJECTILES 64
#define MAX_PARTICLES 128
#define MAX_OBSTACLES 8

// --- Data Types ---
typedef enum {
    PROJ_BULLET = 0,    // High velocity, low mass, low drag, orange tracer
    PROJ_BOUNCER = 1,   // High restitution (bouncy), teal trail
    PROJ_MORTAR = 2,    // High mass, arching gravity, explosive fragmentation on impact
    PROJ_FLOATY = 3     // Near-zero gravity, aerodynamically dampened, rose float
} ProjectileType;

typedef struct {
    float x, y;
    float vx, vy;
    float radius;
    float mass;
    float restitution; // Bounciness factor [0.0 - 1.0]
    float drag;        // Air resistance coefficient
    int active;
    int type;          // ProjectileType
    float life;        // Seconds alive
} Projectile;

typedef struct {
    float x, y;
    float vx, vy;
    float life;
    float maxLife;
    int active;
    int colorIdx;
} Particle;

typedef struct {
    float x, y, w, h;
    float restitution;
} Obstacle;

// --- Global Simulation State ---
static Projectile projectiles[MAX_PROJECTILES];
static Particle particles[MAX_PARTICLES];
static Obstacle obstacles[MAX_OBSTACLES];
static int obstacleCount = 0;

static float worldWidth = 800.0f;
static float worldHeight = 600.0f;
static float gravityY = 980.0f; // px/s^2

// Basic PRNG for deterministic wasm executions
static unsigned int rngState = 123456789;
static float randFloat(void) {
    rngState = (rngState * 1664525u + 1013904223u);
    return (float)(rngState & 0x7FFFFFFF) / 2147483648.0f;
}

// --- Exported C Interface for WebAssembly ---

__attribute__((visibility("default")))
void initWorld(float width, float height) {
    worldWidth = width;
    worldHeight = height;

    for (int i = 0; i < MAX_PROJECTILES; i++) projectiles[i].active = 0;
    for (int i = 0; i < MAX_PARTICLES; i++) particles[i].active = 0;

    obstacleCount = 3;
    // Static obstacles in the arena
    obstacles[0] = (Obstacle){ width * 0.25f, height * 0.55f, width * 0.18f, 24.0f, 0.75f };
    obstacles[1] = (Obstacle){ width * 0.58f, height * 0.40f, width * 0.20f, 24.0f, 0.85f };
    obstacles[2] = (Obstacle){ width * 0.40f, height * 0.75f, width * 0.22f, 24.0f, 0.65f };
}

static void spawnDebris(float x, float y, int count, int colorIdx) {
    for (int i = 0; i < count; i++) {
        for (int p = 0; p < MAX_PARTICLES; p++) {
            if (!particles[p].active) {
                float angle = randFloat() * 6.2831853f;
                float spd = 60.0f + randFloat() * 240.0f;
                particles[p].x = x;
                particles[p].y = y;
                particles[p].vx = spd * (randFloat() - 0.5f) * 2.0f;
                particles[p].vy = -spd * randFloat();
                particles[p].life = 0.0f;
                particles[p].maxLife = 0.4f + randFloat() * 0.5f;
                particles[p].colorIdx = colorIdx;
                particles[p].active = 1;
                break;
            }
        }
    }
}

__attribute__((visibility("default")))
int spawnProjectile(float x, float y, float vx, float vy, int type) {
    for (int i = 0; i < MAX_PROJECTILES; i++) {
        if (!projectiles[i].active) {
            Projectile* p = &projectiles[i];
            p->x = x;
            p->y = y;
            p->vx = vx;
            p->vy = vy;
            p->type = type;
            p->active = 1;
            p->life = 0.0f;

            switch (type) {
                case PROJ_BULLET:
                    p->radius = 4.0f;
                    p->mass = 0.5f;
                    p->restitution = 0.3f;
                    p->drag = 0.0004f;
                    break;
                case PROJ_BOUNCER:
                    p->radius = 8.0f;
                    p->mass = 1.0f;
                    p->restitution = 0.92f; // High bounce
                    p->drag = 0.0008f;
                    break;
                case PROJ_MORTAR:
                    p->radius = 11.0f;
                    p->mass = 3.5f;
                    p->restitution = 0.45f;
                    p->drag = 0.0016f;
                    break;
                case PROJ_FLOATY:
                default:
                    p->radius = 9.0f;
                    p->mass = 0.2f;
                    p->restitution = 0.80f;
                    p->drag = 0.0055f;
                    break;
            }
            return i;
        }
    }
    return -1;
}

__attribute__((visibility("default")))
void updatePhysics(float dt) {
    if (dt > 0.05f) dt = 0.05f; // Clamp delta time spike

    // Update Particles
    for (int i = 0; i < MAX_PARTICLES; i++) {
        if (particles[i].active) {
            particles[i].x += particles[i].vx * dt;
            particles[i].y += particles[i].vy * dt;
            particles[i].vy += gravityY * 0.6f * dt;
            particles[i].life += dt;
            if (particles[i].life >= particles[i].maxLife) {
                particles[i].active = 0;
            }
        }
    }

    // Update Projectiles
    for (int i = 0; i < MAX_PROJECTILES; i++) {
        if (!projectiles[i].active) continue;
        Projectile* p = &projectiles[i];
        p->life += dt;

        // Apply forces: Gravity & Drag
        float effectiveG = gravityY;
        if (p->type == PROJ_FLOATY) effectiveG *= 0.12f;
        else if (p->type == PROJ_MORTAR) effectiveG *= 1.25f;

        // Air drag: F_drag = 0.5 * drag * v^2
        float spd2 = p->vx * p->vx + p->vy * p->vy;
        float dragFactor = 1.0f - (p->drag * dt * 60.0f);
        if (dragFactor < 0.85f) dragFactor = 0.85f;
        p->vx *= dragFactor;
        p->vy = (p->vy + effectiveG * dt) * dragFactor;

        // Integration (Verlet/Euler step)
        p->x += p->vx * dt;
        p->y += p->vy * dt;

        // 1. Boundary Collisions (Walls & Floor)
        // Left & Right walls
        if (p->x - p->radius < 0.0f) {
            p->x = p->radius;
            p->vx = -p->vx * p->restitution;
            spawnDebris(p->x, p->y, 3, p->type);
        } else if (p->x + p->radius > worldWidth) {
            p->x = worldWidth - p->radius;
            p->vx = -p->vx * p->restitution;
            spawnDebris(p->x, p->y, 3, p->type);
        }

        // Ceiling
        if (p->y - p->radius < 0.0f) {
            p->y = p->radius;
            p->vy = -p->vy * p->restitution;
        }

        // Floor collision
        if (p->y + p->radius > worldHeight) {
            p->y = worldHeight - p->radius;
            p->vy = -p->vy * p->restitution;
            // Floor friction
            p->vx *= 0.88f;

            if (p->type == PROJ_MORTAR && p->life > 0.4f) {
                // Mortar explodes on floor impact!
                p->active = 0;
                spawnDebris(p->x, p->y, 24, p->type);
                continue;
            } else {
                spawnDebris(p->x, p->y, 4, p->type);
            }

            // Sleep when kinetic energy falls below threshold
            if (p->vx * p->vx + p->vy * p->vy < 20.0f) {
                p->vx = 0.0f;
                p->vy = 0.0f;
                if (p->life > 3.0f) p->active = 0;
            }
        }

        // 2. Obstacle Box Collisions (AABB vs Sphere Contact Solver)
        for (int o = 0; o < obstacleCount; o++) {
            Obstacle* obs = &obstacles[o];

            // Nearest point on AABB to projectile center
            float closestX = p->x;
            if (closestX < obs->x) closestX = obs->x;
            else if (closestX > obs->x + obs->w) closestX = obs->x + obs->w;

            float closestY = p->y;
            if (closestY < obs->y) closestY = obs->y;
            else if (closestY > obs->y + obs->h) closestY = obs->y + obs->h;

            float distX = p->x - closestX;
            float distY = p->y - closestY;
            float distSq = distX * distX + distY * distY;

            if (distSq < p->radius * p->radius && distSq > 0.0001f) {
                // Collision normal
                float overlap = p->radius; // approximation
                if (p->y < obs->y) {
                    // Top collision
                    p->y = obs->y - p->radius;
                    p->vy = -p->vy * p->restitution * obs->restitution;
                    p->vx *= 0.92f;
                } else if (p->y > obs->y + obs->h) {
                    // Bottom collision
                    p->y = obs->y + obs->h + p->radius;
                    p->vy = -p->vy * p->restitution * obs->restitution;
                } else if (p->x < obs->x) {
                    // Left collision
                    p->x = obs->x - p->radius;
                    p->vx = -p->vx * p->restitution * obs->restitution;
                } else {
                    // Right collision
                    p->x = obs->x + obs->w + p->radius;
                    p->vx = -p->vx * p->restitution * obs->restitution;
                }

                if (p->type == PROJ_MORTAR && p->life > 0.3f) {
                    p->active = 0;
                    spawnDebris(p->x, p->y, 28, p->type);
                    break;
                } else {
                    spawnDebris(closestX, closestY, 6, p->type);
                }
            }
        }

        // Despawn old projectiles
        if (p->life > 12.0f) p->active = 0;
    }
}

// --- Getters for Web Renderers ---
__attribute__((visibility("default")))
int getProjectileCount(void) { return MAX_PROJECTILES; }

__attribute__((visibility("default")))
int getParticleCount(void) { return MAX_PARTICLES; }

__attribute__((visibility("default")))
int getObstacleCount(void) { return obstacleCount; }

__attribute__((visibility("default")))
void* getProjectilesBuffer(void) { return (void*)projectiles; }

__attribute__((visibility("default")))
void* getParticlesBuffer(void) { return (void*)particles; }

__attribute__((visibility("default")))
void* getObstaclesBuffer(void) { return (void*)obstacles; }
