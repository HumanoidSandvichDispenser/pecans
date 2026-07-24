#!/usr/bin/env bun
import { join } from "node:path";
import { python } from "./backends/python";
import { emit } from "./emit";
import { buildIr } from "./ir";

const SPEC = join(import.meta.dir, "..", "main.tsp");

await emit(await buildIr(SPEC), python);
