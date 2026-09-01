import type { DoctorResult } from "./project-doctor.js";
export declare function formatDoctorResults(results: readonly DoctorResult[]): string;
export declare function formatDoctorJson(results: readonly DoctorResult[]): string;
export declare function doctorExitCode(results: readonly DoctorResult[]): 0 | 1;
