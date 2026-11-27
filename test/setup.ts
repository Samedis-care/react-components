import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Testing Library unmounts what a test rendered only when it finds a global afterEach,
// and the unit project runs without vitest's globals. Without this, a test's render stays
// mounted into the next tests of its file and past the file's end, where its late timers
// and loads run after the environment is gone ("window is not defined").
afterEach(cleanup);
