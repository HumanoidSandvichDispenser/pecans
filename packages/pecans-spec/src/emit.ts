import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { IrModule, IrProgram } from "./ir";

export interface GenFile {
    path: string;
    content: string;
}

/**
 * A language target. It only renders the neutral IR into source text; the file
 * layout and write loop are shared by {@link emit}.
 */
export interface Backend {
    outDir: string;
    ext: string;
    indexFile: string;
    renderTypes(ir: IrProgram): Promise<string> | string;
    renderEnums(ir: IrProgram): string;
    renderDecoders(ir: IrProgram): string;
    renderEncoders(ir: IrProgram): string;
    renderClient(ir: IrProgram): string;
    renderIndex(ir: IrProgram): string;
    renderModule(mod: IrModule, ir: IrProgram): string;
    extraFiles?(ir: IrProgram): GenFile[];
}

/** Render an IR through a backend and write the generated tree to disk. */
export async function emit(ir: IrProgram, backend: Backend): Promise<void> {
    const files: GenFile[] = [
        { path: `types.${backend.ext}`, content: await backend.renderTypes(ir) },
        { path: `enums.${backend.ext}`, content: backend.renderEnums(ir) },
        { path: `client.${backend.ext}`, content: backend.renderClient(ir) },
        { path: backend.indexFile, content: backend.renderIndex(ir) },
    ];

    if (ir.hasDecoders) {
        files.push({ path: `decoders.${backend.ext}`, content: backend.renderDecoders(ir) });
    }

    if (ir.hasEncoders) {
        files.push({ path: `encoders.${backend.ext}`, content: backend.renderEncoders(ir) });
    }

    for (const mod of ir.modules) {
        files.push({
            path: `modules/${mod.name}.${backend.ext}`,
            content: backend.renderModule(mod, ir),
        });
    }

    if (backend.extraFiles) {
        files.push(...backend.extraFiles(ir));
    }

    await rm(backend.outDir, { recursive: true, force: true });
    await mkdir(join(backend.outDir, "modules"), { recursive: true });

    for (const file of files) {
        await writeFile(join(backend.outDir, file.path), file.content);
    }

    console.log(`generated ${ir.modules.length} modules -> ${backend.outDir}`);
}
