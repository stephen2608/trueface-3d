package com.trueface3d.dto;

import com.trueface3d.spatial.model.Point3D;
import java.util.List;

public class SpatialFrameDto {
    private String sessionUuid;
    private Long timestampMs;
    private List<Point3D> landmarks;

    public SpatialFrameDto() {}

    public String getSessionUuid() { return sessionUuid; }
    public void setSessionUuid(String sessionUuid) { this.sessionUuid = sessionUuid; }

    public Long getTimestampMs() { return timestampMs; }
    public void setTimestampMs(Long timestampMs) { this.timestampMs = timestampMs; }

    public List<Point3D> getLandmarks() { return landmarks; }
    public void setLandmarks(List<Point3D> landmarks) { this.landmarks = landmarks; }
}
