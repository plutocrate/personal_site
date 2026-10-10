// =============================================================================
// Raylib-Style 3D Utah Teapot Rendering & Continuous Inertia Kernel
// Author: Pratham Purohit
// Targets: freestanding wasm32 (-O3 -nostdlib)
// Features:
// - Parametric Utah Teapot 3D mesh (Body rings, lid knob, spout, loop handle)
// - Robust continuous Euler rotation (Bhaskara trigonometric polynomial)
// - Constant smooth ambient rotation + additive drag flick torque
// - 3D affine matrix transformation & depth cueing
// =============================================================================

#define MAX_VERTICES 320
#define MAX_EDGES 480
#define MAX_FACES 240
#define PI 3.14159265358979323846f
#define TWO_PI 6.28318530717958647692f

typedef struct {
    float x, y, z;
} Vec3;

typedef struct {
    int v0, v1;
} Edge;

typedef struct {
    int v0, v1, v2, v3; // Quad polygon (or triangle if v3 == -1)
} Face;

typedef struct {
    float x, y, z;
    float rx, ry, rz;       // Continuous Euler angles (radians)
    float vx_rot, vy_rot;   // Dynamic angular momentum
    float baseSpin;         // Constant base rotation speed (rad/s)
    float scale;
} TeapotState;

static TeapotState state;
static Vec3 baseVertices[MAX_VERTICES];
static Vec3 transformedVertices[MAX_VERTICES];
static Edge edges[MAX_EDGES];
static Face faces[MAX_FACES];
static int vertexCount = 0;
static int edgeCount = 0;
static int faceCount = 0;

// High-fidelity Bhaskara I trigonometric approximation (Max error < 0.0016 across all angles)
// Fast O(1) execution without loops or drift over indefinite rotations
static float sinF(float x) {
    // Wrap to [0, TWO_PI)
    if (x < 0.0f) {
        float k = (float)((int)(-x / TWO_PI) + 1);
        x += k * TWO_PI;
    }
    if (x >= TWO_PI) {
        float k = (float)((int)(x / TWO_PI));
        x -= k * TWO_PI;
    }

    if (x <= PI) {
        float num = 16.0f * x * (PI - x);
        float den = 5.0f * PI * PI - 4.0f * x * (PI - x);
        return num / den;
    } else {
        x -= PI;
        float num = 16.0f * x * (PI - x);
        float den = 5.0f * PI * PI - 4.0f * x * (PI - x);
        return -(num / den);
    }
}

static float cosF(float x) {
    return sinF(x + PI * 0.5f);
}

static void addVertex(float x, float y, float z) {
    if (vertexCount < MAX_VERTICES) {
        baseVertices[vertexCount].x = x;
        baseVertices[vertexCount].y = y;
        baseVertices[vertexCount].z = z;
        vertexCount++;
    }
}

static void addEdge(int v0, int v1) {
    if (edgeCount < MAX_EDGES) {
        edges[edgeCount].v0 = v0;
        edges[edgeCount].v1 = v1;
        edgeCount++;
    }
}

static void addFace(int v0, int v1, int v2, int v3) {
    if (faceCount < MAX_FACES) {
        faces[faceCount].v0 = v0;
        faces[faceCount].v1 = v1;
        faces[faceCount].v2 = v2;
        faces[faceCount].v3 = v3;
        faceCount++;
    }
}

// Procedurally generate the iconic Utah Teapot geometric topology
static void generateTeapotGeometry(void) {
    vertexCount = 0;
    edgeCount = 0;
    faceCount = 0;

    // Body rings (lathe of teapot profile)
    int latSegments = 7;
    int lonSegments = 14;
    float bodyRadii[7] = { 0.45f, 0.95f, 1.25f, 1.35f, 1.2f, 0.85f, 0.7f };
    float bodyY[7]     = { -0.7f, -0.45f, -0.15f, 0.15f, 0.45f, 0.7f,  0.8f };

    for (int lat = 0; lat < latSegments; lat++) {
        float r = bodyRadii[lat];
        float y = bodyY[lat];
        for (int lon = 0; lon < lonSegments; lon++) {
            float phi = (TWO_PI * (float)lon) / (float)lonSegments;
            addVertex(r * cosF(phi), y, r * sinF(phi));
        }
    }

    // Connect body rings, longitudinal ribs, and quad faces
    for (int lat = 0; lat < latSegments; lat++) {
        int base = lat * lonSegments;
        for (int lon = 0; lon < lonSegments; lon++) {
            int nextLon = (lon + 1) % lonSegments;
            addEdge(base + lon, base + nextLon);
            if (lat < latSegments - 1) {
                int nextRow = base + lonSegments;
                addEdge(base + lon, nextRow + lon);
                // Quad face spanning between ring (lat) and ring (lat + 1)
                addFace(base + lon, base + nextLon, nextRow + nextLon, nextRow + lon);
            }
        }
    }

    // Lid knob
    int lidBase = vertexCount;
    addVertex(0.0f, 1.05f, 0.0f);
    for (int i = 0; i < 8; i++) {
        float phi = (TWO_PI * (float)i) / 8.0f;
        addVertex(0.22f * cosF(phi), 0.92f, 0.22f * sinF(phi));
        addEdge(lidBase, lidBase + 1 + i);
        addEdge(lidBase + 1 + i, lidBase + 1 + ((i + 1) % 8));
        addFace(lidBase, lidBase + 1 + i, lidBase + 1 + ((i + 1) % 8), -1);
    }

    // Spout curve
    int spoutBase = vertexCount;
    float spoutProfileX[5] = { 1.05f, 1.45f, 1.85f, 2.15f, 2.3f };
    float spoutProfileY[5] = { 0.05f, 0.35f, 0.7f, 1.05f, 1.2f };
    float spoutRadius[5]   = { 0.24f, 0.2f, 0.16f, 0.13f, 0.11f };

    for (int s = 0; s < 5; s++) {
        float sx = spoutProfileX[s];
        float sy = spoutProfileY[s];
        float sr = spoutRadius[s];
        for (int k = 0; k < 6; k++) {
            float th = (TWO_PI * (float)k) / 6.0f;
            addVertex(sx + sr * cosF(th) * 0.4f, sy + sr * sinF(th), sr * cosF(th));
        }
    }
    for (int s = 0; s < 4; s++) {
        int b1 = spoutBase + s * 6;
        int b2 = spoutBase + (s + 1) * 6;
        for (int k = 0; k < 6; k++) {
            int nk = (k + 1) % 6;
            addEdge(b1 + k, b1 + nk);
            addEdge(b1 + k, b2 + k);
            addFace(b1 + k, b1 + nk, b2 + nk, b2 + k);
        }
    }
    for (int k = 0; k < 6; k++) addEdge(spoutBase + 24 + k, spoutBase + 24 + ((k + 1) % 6));

    // Handle loop (arches outward toward -X)
    int handleBase = vertexCount;
    for (int h = 0; h < 9; h++) {
        float t = (float)h / 8.0f;
        float ang = -PI * 0.5f + t * PI; // -PI/2 to +PI/2
        float hx = -1.25f - 0.78f * cosF(ang); // bows outward to x = -2.03
        float hy = 0.2f + 0.65f * sinF(ang);   // connects top y=0.85 to bottom y=-0.45
        addVertex(hx, hy, 0.08f);
        addVertex(hx, hy, -0.08f);
        if (h > 0) {
            addEdge(handleBase + (h - 1) * 2, handleBase + h * 2);
            addEdge(handleBase + (h - 1) * 2 + 1, handleBase + h * 2 + 1);
            addEdge(handleBase + h * 2, handleBase + h * 2 + 1);
            addFace(handleBase + (h - 1) * 2, handleBase + h * 2, handleBase + h * 2 + 1, handleBase + (h - 1) * 2 + 1);
        }
    }
}

__attribute__((visibility("default")))
void initTeapot(void) {
    generateTeapotGeometry();
    state.rx = 0.38f;
    state.ry = 0.0f;
    state.rz = 0.0f;
    state.vx_rot = 0.0f;
    state.vy_rot = 0.0f;
    state.baseSpin = 0.85f; // Constant steady auto-rotation speed (rad/sec)
    state.scale = 100.0f;
}

__attribute__((visibility("default")))
void addTeapotTorque(float dPitch, float dYaw) {
    state.vx_rot += dPitch;
    state.vy_rot += dYaw;
}

__attribute__((visibility("default")))
void updateTeapot(float dt) {
    if (dt > 0.05f) dt = 0.05f;

    // 1. Continuous auto-rotation + dynamic user momentum
    state.ry += (state.baseSpin + state.vy_rot) * dt;
    state.rx += state.vx_rot * dt;

    // Keep pitch bounded comfortably so teapot never flips upside-down awkwardly
    if (state.rx > 0.85f) state.rx = 0.85f;
    if (state.rx < -0.45f) state.rx = -0.45f;

    // Wrap yaw cleanly to [0, TWO_PI)
    if (state.ry >= TWO_PI) {
        float k = (float)((int)(state.ry / TWO_PI));
        state.ry -= k * TWO_PI;
    } else if (state.ry < 0.0f) {
        float k = (float)((int)(-state.ry / TWO_PI) + 1);
        state.ry += k * TWO_PI;
    }

    // 2. Smooth exponential decay of added user flick torque back to steady base rotation
    state.vx_rot *= 0.94f;
    state.vy_rot *= 0.94f;

    // 3. 3D Euler Transformation Matrix (Yaw Y, Pitch X)
    float cy = cosF(state.ry);
    float sy = sinF(state.ry);
    float cx = cosF(state.rx);
    float sx = sinF(state.rx);

    for (int i = 0; i < vertexCount; i++) {
        Vec3 v = baseVertices[i];

        // Yaw around Y
        float x1 = v.x * cy + v.z * sy;
        float y1 = v.y;
        float z1 = -v.x * sy + v.z * cy;

        // Pitch around X
        float x2 = x1;
        float y2 = y1 * cx - z1 * sx;
        float z2 = y1 * sx + z1 * cx;

        transformedVertices[i].x = x2;
        transformedVertices[i].y = y2;
        transformedVertices[i].z = z2;
    }
}

__attribute__((visibility("default")))
int getVertexCount(void) { return vertexCount; }

__attribute__((visibility("default")))
int getEdgeCount(void) { return edgeCount; }

__attribute__((visibility("default")))
void* getTransformedVertices(void) { return (void*)transformedVertices; }

__attribute__((visibility("default")))
void* getEdges(void) { return (void*)edges; }

__attribute__((visibility("default")))
int getFaceCount(void) { return faceCount; }

__attribute__((visibility("default")))
void* getFaces(void) { return (void*)faces; }

__attribute__((visibility("default")))
float getRotationY(void) { return state.ry; }

__attribute__((visibility("default")))
float getRotationX(void) { return state.rx; }
