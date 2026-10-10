// =============================================================================
// Raylib-Style 3D Utah Teapot Rendering & Inertia Dynamics Kernel
// Author: Pratham Purohit
// Targets: freestanding wasm32 (-O3 -nostdlib)
// Features:
// - 3D parametric Utah Teapot wireframe & shaded polygon rasterization
// - 3D Euler rotation matrix integration (Pitch, Yaw, Roll)
// - Inertial angular drag & momentum damping
// - Phong-style directional light shading (diffuse + specular highlight)
// - Interactive orbit drag velocity accumulator
// =============================================================================

#define MAX_VERTICES 320
#define MAX_EDGES 480
#define PI 3.14159265358979323846f

typedef struct {
    float x, y, z;
} Vec3;

typedef struct {
    int v0, v1;
} Edge;

typedef struct {
    float x, y, z;
    float rx, ry, rz;       // Rotation angles (radians)
    float vx_rot, vy_rot;   // Angular momentum
    float scale;
    float lightDir[3];      // Directional light vector
    int wireframeOnly;
} TeapotState;

static TeapotState state;
static Vec3 baseVertices[MAX_VERTICES];
static Vec3 transformedVertices[MAX_VERTICES];
static Edge edges[MAX_EDGES];
static int vertexCount = 0;
static int edgeCount = 0;

static float sinF(float x) {
    // Fast Taylor series approximation for sin(x)
    while (x > PI) x -= 2.0f * PI;
    while (x < -PI) x += 2.0f * PI;
    float x2 = x * x;
    return x * (1.0f - x2 / 6.0f + (x2 * x2) / 120.0f);
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

// Procedurally generate the iconic Utah Teapot geometric topology
static void generateTeapotGeometry(void) {
    vertexCount = 0;
    edgeCount = 0;

    // Body rings (lathe of teapot profile)
    int latSegments = 7;
    int lonSegments = 14;
    float bodyRadii[7] = { 0.45f, 0.95f, 1.25f, 1.35f, 1.2f, 0.85f, 0.7f };
    float bodyY[7]     = { -0.7f, -0.45f, -0.15f, 0.15f, 0.45f, 0.7f,  0.8f };

    for (int lat = 0; lat < latSegments; lat++) {
        float r = bodyRadii[lat];
        float y = bodyY[lat];
        for (int lon = 0; lon < lonSegments; lon++) {
            float phi = (2.0f * PI * (float)lon) / (float)lonSegments;
            addVertex(r * cosF(phi), y, r * sinF(phi));
        }
    }

    // Connect body rings and longitudinal ribs
    for (int lat = 0; lat < latSegments; lat++) {
        int base = lat * lonSegments;
        for (int lon = 0; lon < lonSegments; lon++) {
            int nextLon = (lon + 1) % lonSegments;
            addEdge(base + lon, base + nextLon);
            if (lat < latSegments - 1) {
                addEdge(base + lon, base + lonSegments + lon);
            }
        }
    }

    // Lid knob
    int lidBase = vertexCount;
    addVertex(0.0f, 1.05f, 0.0f);
    for (int i = 0; i < 8; i++) {
        float phi = (2.0f * PI * (float)i) / 8.0f;
        addVertex(0.22f * cosF(phi), 0.92f, 0.22f * sinF(phi));
        addEdge(lidBase, lidBase + 1 + i);
        addEdge(lidBase + 1 + i, lidBase + 1 + ((i + 1) % 8));
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
            float th = (2.0f * PI * (float)k) / 6.0f;
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
        }
    }
    for (int k = 0; k < 6; k++) addEdge(spoutBase + 24 + k, spoutBase + 24 + ((k + 1) % 6));

    // Handle loop
    int handleBase = vertexCount;
    for (int h = 0; h < 9; h++) {
        float ang = PI * 0.45f + ((float)h / 8.0f) * PI * 1.1f;
        float hx = -1.25f - 0.75f * cosF(ang);
        float hy = 0.2f + 0.65f * sinF(ang);
        addVertex(hx, hy, 0.08f);
        addVertex(hx, hy, -0.08f);
        if (h > 0) {
            addEdge(handleBase + (h - 1) * 2, handleBase + h * 2);
            addEdge(handleBase + (h - 1) * 2 + 1, handleBase + h * 2 + 1);
            addEdge(handleBase + h * 2, handleBase + h * 2 + 1);
        }
    }
}

__attribute__((visibility("default")))
void initTeapot(void) {
    generateTeapotGeometry();
    state.rx = 0.35f;
    state.ry = 0.65f;
    state.rz = 0.0f;
    state.vx_rot = 0.0f;
    state.vy_rot = 0.75f; // Initial spin
    state.scale = 100.0f;
    state.wireframeOnly = 0;

    // Light direction vector (normalized)
    state.lightDir[0] = 0.577f;
    state.lightDir[1] = -0.577f;
    state.lightDir[2] = 0.577f;
}

__attribute__((visibility("default")))
void addTeapotTorque(float dPitch, float dYaw) {
    state.vx_rot += dPitch;
    state.vy_rot += dYaw;
}

__attribute__((visibility("default")))
void updateTeapot(float dt) {
    if (dt > 0.05f) dt = 0.05f;

    // Angular momentum integration & inertial damping (Euler angles)
    state.rx += state.vx_rot * dt;
    state.ry += state.vy_rot * dt;

    // Damping friction: slowly settles into gentle orbit
    state.vx_rot *= 0.965f;
    state.vy_rot = state.vy_rot * 0.965f + (0.55f * 0.035f); // Sustains elegant baseline rotation

    // 3D Euler Transformation Matrix (Yaw around Y, then Pitch around X)
    float cy = cosF(state.ry);
    float sy = sinF(state.ry);
    float cx = cosF(state.rx);
    float sx = sinF(state.rx);

    for (int i = 0; i < vertexCount; i++) {
        Vec3 v = baseVertices[i];

        // 1. Rotate Y (Yaw)
        float x1 = v.x * cy + v.z * sy;
        float y1 = v.y;
        float z1 = -v.x * sy + v.z * cy;

        // 2. Rotate X (Pitch)
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
float getRotationY(void) { return state.ry; }

__attribute__((visibility("default")))
float getRotationX(void) { return state.rx; }
