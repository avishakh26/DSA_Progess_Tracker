package com.dsajourney.desktop.domain;

import java.time.LocalDate;

public class DayCount {
    public final LocalDate date;
    public final int count;

    public DayCount(LocalDate date, int count) {
        this.date = date;
        this.count = count;
    }
}
