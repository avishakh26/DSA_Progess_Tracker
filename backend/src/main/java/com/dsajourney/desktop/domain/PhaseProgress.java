package com.dsajourney.desktop.domain;

public class PhaseProgress {
    public final int phase;
    public final int total;
    public final int done;

    public PhaseProgress(int phase, int total, int done) {
        this.phase = phase;
        this.total = total;
        this.done = done;
    }

    public int percent() {
        return total <= 0 ? 0 : done * 100 / total;
    }
}
