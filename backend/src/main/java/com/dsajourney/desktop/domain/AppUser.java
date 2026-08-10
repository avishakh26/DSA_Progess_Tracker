package com.dsajourney.desktop.domain;

public class AppUser {
    public final String id;
    public final String name;
    public final String email;
    public final String image;
    public final int dailyGoal;
    public final String handleCf;
    public final String handleLc;

    public AppUser(String id, String name, String email, String image,
                   int dailyGoal, String handleCf, String handleLc) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.image = image;
        this.dailyGoal = dailyGoal;
        this.handleCf = handleCf;
        this.handleLc = handleLc;
    }

    public String displayName() {
        return (name == null || name.isBlank()) ? email : name;
    }

    public String firstName() {
        String n = displayName().trim();
        int space = n.indexOf(' ');
        return space > 0 ? n.substring(0, space) : n;
    }
}
