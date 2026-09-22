package com.trueface3d.dto;

public class SessionStartDto {
    private String title;
    private String mode; // INTERVIEW_COACH, MINDFUL_WELLNESS, ERGONOMICS_SENTINEL

    public SessionStartDto() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
}
