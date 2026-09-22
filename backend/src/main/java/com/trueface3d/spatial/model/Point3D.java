package com.trueface3d.spatial.model;

/**
 * High-performance immutable 3D Cartesian Coordinate representation
 * with vector algebra operations for spatial facial biomechanics.
 */
public record Point3D(double x, double y, double z) {

    public double distanceTo(Point3D other) {
        if (other == null) return 0.0;
        double dx = this.x - other.x;
        double dy = this.y - other.y;
        double dz = this.z - other.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    public double distance3D(Point3D other) {
        return distanceTo(other);
    }

    public double distance2D(Point3D other) {
        if (other == null) return 0.0;
        double dx = this.x - other.x;
        double dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    public Point3D subtract(Point3D other) {
        return new Point3D(this.x - other.x, this.y - other.y, this.z - other.z);
    }

    public Point3D add(Point3D other) {
        return new Point3D(this.x + other.x, this.y + other.y, this.z + other.z);
    }

    public Point3D midpoint(Point3D other) {
        return new Point3D((this.x + other.x) / 2.0, (this.y + other.y) / 2.0, (this.z + other.z) / 2.0);
    }

    public double magnitude() {
        return Math.sqrt(x * x + y * y + z * z);
    }

    public Point3D normalize() {
        double mag = magnitude();
        if (mag < 1e-9) return new Point3D(0, 0, 0);
        return new Point3D(x / mag, y / mag, z / mag);
    }

    public double dot(Point3D other) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    public Point3D cross(Point3D other) {
        return new Point3D(
            this.y * other.z - this.z * other.y,
            this.z * other.x - this.x * other.z,
            this.x * other.y - this.y * other.x
        );
    }
}
