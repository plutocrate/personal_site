// =============================================================================
// WebAssembly 2D Multi-Body Rigid & Particle Physics Kernel
// Author: Pratham Purohit
// Targets: freestanding wasm32 (-O3 -nostdlib)
// Features:
// - Multi-shape kinematics (Circle, Box, Triangle, Pentagon, Beam)
// - Gravitational acceleration & drag integration
// - Pairwise impulse collision resolution (Newton restitution)
// - Arena boundary reflections & surface friction
// - Slingshot kinetic impulse injection
// - Particle spark emitter
// =============================================================================

#define MAX_BODIES 48
#define MAX_SPARKS 96

// Shape primitive IDs
#define SHAPE_CIRCLE 0
#define SHAPE_RECT 1
#define SHAPE_TRIANGLE 2
#define SHAPE_PENTAGON 3
#define SHAPE_LINE 4

typedef struct {
    float x, y;
    float vx, vy;
    float angle, va;
    float radius;
    float w, h;
    float mass;
    float restitution;
    int shapeType;
    int colorIdx;
    int active;
} Body;

typedef struct {
    float x, y;
    float vx, vy;
    float life;
    float maxLife;
    int colorIdx;
    int active;
} Spark;

// Global world state
static Body bodies[MAX_BODIES];
static Spark sparks[MAX_SPARKS];

static float worldWidth = 800.0f;
static float worldHeight = 600.0f;
static float gravityY = 980.0f;
static float airDrag = 0.998f;
static float surfaceFriction = 0.94f;

// Deterministic PRNG
static unsigned int rng = 54321;
static float randF(void) {
    rng = (rng * 1664525u + 1013904223u);
    return (float)(rng & 0x7FFFFFFF) / 2147483648.0f;
}

// Spark emitter
static void emitSparks(float x, float y, int colorIdx, int count) {
    for (int k = 0; k < count; k++) {
        for (int i = 0; i < MAX_SPARKS; i++) {
            if (!sparks[i].active) {
                float ang = randF() * 6.2831853f;
                float spd = 40.0f + randF() * 120.0f;
                sparks[i].x = x;
                sparks[i].y = y;
                sparks[i].vx = spd * (float)(randF() - 0.5f) * 2.0f;
                sparks[i].vy = -spd * (0.3f + randF() * 0.7f);
                sparks[i].life = 0.0f;
                sparks[i].maxLife = 0.35f + randF() * 0.35f;
                sparks[i].colorIdx = colorIdx;
                sparks[i].active = 1;
                break;
            }
        }
    }
}

__attribute__((visibility("default")))
void initPhysicsWorld(float w, float h) {
    worldWidth = w;
    worldHeight = h;
    for (int i = 0; i < MAX_BODIES; i++) bodies[i].active = 0;
    for (int i = 0; i < MAX_SPARKS; i++) sparks[i].active = 0;
}

__attribute__((visibility("default")))
int spawnBody(int type, float x, float y, float vx, float vy, int colorIdx) {
    for (int i = 0; i < MAX_BODIES; i++) {
        if (!bodies[i].active) {
            Body* b = &bodies[i];
            b->shapeType = type;
            b->x = x;
            b->y = y;
            b->vx = vx;
            b->vy = vy;
            b->angle = (randF() - 0.5f) * 0.5f;
            b->va = (randF() - 0.5f) * 3.0f;
            b->colorIdx = colorIdx;
            b->restitution = 0.75f + randF() * 0.12f;
            b->active = 1;

            if (type == SHAPE_CIRCLE) {
                b->radius = 20.0f + randF() * 8.0f;
                b->w = b->radius * 2.0f;
                b->h = b->radius * 2.0f;
                b->mass = (b->radius * b->radius) / 400.0f;
            } else if (type == SHAPE_RECT) {
                b->w = 38.0f + randF() * 16.0f;
                b->h = 28.0f + randF() * 14.0f;
                b->radius = (b->w > b->h ? b->w : b->h) * 0.6f;
                b->mass = (b->w * b->h) / 600.0f;
            } else if (type == SHAPE_TRIANGLE) {
                float size = 34.0f + randF() * 12.0f;
                b->w = size;
                b->h = size;
                b->radius = size * 0.65f;
                b->mass = (size * size) / 500.0f;
            } else if (type == SHAPE_PENTAGON) {
                b->radius = 24.0f + randF() * 8.0f;
                b->w = b->radius * 2.0f;
                b->h = b->radius * 2.0f;
                b->mass = (b->radius * b->radius) / 380.0f;
            } else { // SHAPE_LINE / BEAM
                b->w = 60.0f + randF() * 20.0f;
                b->h = 10.0f;
                b->radius = b->w * 0.5f;
                b->mass = (b->w * b->h) / 300.0f;
            }

            emitSparks(x, y, colorIdx, 5);
            return i;
        }
    }
    return -1;
}

__attribute__((visibility("default")))
void applyImpulse(int index, float vx, float vy, float va) {
    if (index >= 0 && index < MAX_BODIES && bodies[index].active) {
        bodies[index].vx = vx;
        bodies[index].vy = vy;
        bodies[index].va = va;
        emitSparks(bodies[index].x, bodies[index].y, bodies[index].colorIdx, 8);
    }
}

__attribute__((visibility("default")))
void stepPhysics(float dt) {
    if (dt > 0.033f) dt = 0.033f;

    // 1. Update Sparks
    for (int i = 0; i < MAX_SPARKS; i++) {
        if (sparks[i].active) {
            sparks[i].x += sparks[i].vx * dt;
            sparks[i].y += sparks[i].vy * dt;
            sparks[i].vy += 450.0f * dt;
            sparks[i].life += dt;
            if (sparks[i].life >= sparks[i].maxLife) sparks[i].active = 0;
        }
    }

    // 2. Rigid Body Integration & Boundary Collisions
    float floorY = worldHeight - 18.0f;
    float ceilY = 52.0f;
    float leftX = 16.0f;
    float rightX = worldWidth - 16.0f;

    for (int i = 0; i < MAX_BODIES; i++) {
        if (!bodies[i].active) continue;
        Body* b = &bodies[i];

        // Gravitational acceleration & drag
        b->vy += gravityY * dt;
        b->vx *= airDrag;
        b->vy *= airDrag;
        b->va *= 0.99f;

        // Position & Angle Integration
        b->x += b->vx * dt;
        b->y += b->vy * dt;
        b->angle += b->va * dt;

        // Floor collision
        if (b->y + b->radius > floorY) {
            b->y = floorY - b->radius;
            if (b->vy > 0.0f) {
                b->vy = -b->vy * b->restitution;
                b->vx *= surfaceFriction;
                b->va *= 0.85f;
                if (b->vy < -60.0f) emitSparks(b->x, floorY, b->colorIdx, 3);
            }
        }
        // Ceiling
        if (b->y - b->radius < ceilY) {
            b->y = ceilY + b->radius;
            if (b->vy < 0.0f) b->vy = -b->vy * b->restitution;
        }
        // Left wall
        if (b->x - b->radius < leftX) {
            b->x = leftX + b->radius;
            if (b->vx < 0.0f) {
                b->vx = -b->vx * b->restitution;
                b->va += b->vy * 0.02f;
            }
        }
        // Right wall
        if (b->x + b->radius > rightX) {
            b->x = rightX - b->radius;
            if (b->vx > 0.0f) {
                b->vx = -b->vx * b->restitution;
                b->va -= b->vy * 0.02f;
            }
        }
    }

    // 3. Pairwise Impulse Collision Solver
    for (int i = 0; i < MAX_BODIES; i++) {
        if (!bodies[i].active) continue;
        Body* a = &bodies[i];

        for (int j = i + 1; j < MAX_BODIES; j++) {
            if (!bodies[j].active) continue;
            Body* b = &bodies[j];

            float dx = b->x - a->x;
            float dy = b->y - a->y;
            float distSq = dx * dx + dy * dy;
            float minDist = a->radius + b->radius;

            if (distSq < minDist * minDist && distSq > 0.001f) {
                // Approximate square root via fast iterations
                float dist = distSq;
                // Basic Newton-Raphson for dist = sqrt(distSq)
                float xhalf = 0.5f * dist;
                int i_val = *(int*)&dist;
                i_val = 0x5f3759df - (i_val >> 1);
                float invDist = *(float*)&i_val;
                invDist = invDist * (1.5f - xhalf * invDist * invDist);
                dist = distSq * invDist;

                float nx = dx * invDist;
                float ny = dy * invDist;

                // De-penetration
                float overlap = minDist - dist;
                a->x -= nx * overlap * 0.5f;
                a->y -= ny * overlap * 0.5f;
                b->x += nx * overlap * 0.5f;
                b->y += ny * overlap * 0.5f;

                // Relative velocity
                float rvx = b->vx - a->vx;
                float rvy = b->vy - a->vy;
                float velAlongNormal = rvx * nx + rvy * ny;

                if (velAlongNormal < 0.0f) {
                    float e = a->restitution < b->restitution ? a->restitution : b->restitution;
                    float invMassSum = (1.0f / a->mass) + (1.0f / b->mass);
                    float impulse = -(1.0f + e) * velAlongNormal / invMassSum;

                    float impX = impulse * nx;
                    float impY = impulse * ny;

                    a->vx -= impX / a->mass;
                    a->vy -= impY / a->mass;
                    b->vx += impX / b->mass;
                    b->vy += impY / b->mass;

                    a->va += (randF() - 0.5f) * 4.0f;
                    b->va += (randF() - 0.5f) * 4.0f;

                    if (velAlongNormal < -100.0f) {
                        emitSparks(a->x + nx * a->radius, a->y + ny * a->radius, a->colorIdx, 4);
                    }
                }
            }
        }
    }
}

// Memory buffer accessors for JS
__attribute__((visibility("default")))
void* getBodiesBuffer(void) { return (void*)bodies; }

__attribute__((visibility("default")))
int getMaxBodies(void) { return MAX_BODIES; }

__attribute__((visibility("default")))
void* getSparksBuffer(void) { return (void*)sparks; }

__attribute__((visibility("default")))
int getMaxSparks(void) { return MAX_SPARKS; }
