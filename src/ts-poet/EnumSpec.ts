import { imm, Imm } from 'ts-imm';
import { CodeBlock } from './CodeBlock';
import { CodeWriter } from './CodeWriter';
import { Modifier } from './Modifier';
import { check } from './utils';

export class EnumSpec extends Imm<EnumSpec> {
  public static create(name: string): EnumSpec {
    return new EnumSpec({
      name,
      javaDoc: CodeBlock.empty(),
      modifiers: [],
      constants: new Map(),
    });
  }

  @imm
  public readonly name!: string;
  @imm
  public readonly javaDoc!: CodeBlock;
  @imm
  public readonly modifiers!: Modifier[];
  @imm
  public readonly constants!: Map<string, {value: CodeBlock | undefined, javaDoc: CodeBlock | undefined}>;

  public emit(codeWriter: CodeWriter): void {
    codeWriter.emitJavaDoc(this.javaDoc);
    codeWriter.emitModifiers(this.modifiers);
    codeWriter.emitCode('enum %L {\n', this.name);
    codeWriter.indent();
    let left = this.constants.size;
    this.constants.forEach((constant, key) => {
      if (constant.javaDoc) {
        codeWriter.emitJavaDoc(constant.javaDoc)
      }
      codeWriter.emitCode('%L', key);
      if (constant.value) {
        codeWriter.emitCode(' = ');
        codeWriter.emitCodeBlock(constant.value);
      }
      if (left-- > 0) {
        codeWriter.emit(',\n');
      } else {
        codeWriter.emit('\n');
      }
    });
    codeWriter.unindent();
    codeWriter.emit('}\n');
  }

  public addJavadoc(format: string, ...args: unknown[]): this {
    return this.copy({
      javaDoc: this.javaDoc.add(format, ...args),
    });
  }

  public addJavadocBlock(block: CodeBlock): this {
    return this.copy({
      javaDoc: this.javaDoc.addCode(block),
    });
  }

  public addModifiers(...modifiers: Modifier[]): this {
    modifiers.forEach(it => check(it === Modifier.EXPORT || it === Modifier.DECLARE || it === Modifier.CONST));
    modifiers.forEach(m => this.modifiers.push(m));
    return this;
  }

  public addConstant(name: string, initializer?: string | CodeBlock, javaDoc?: CodeBlock): this {
    // require(name.isName) { "not a valid enum constant: $name" }
    this.constants.set(name, {value: typeof initializer === 'string' ? CodeBlock.of(initializer) : initializer, javaDoc: javaDoc });
    return this;
  }

  public toString(): string {
    return CodeWriter.emitToString(this);
  }

  private hasNoBody(): boolean {
    return this.constants.size === 0;
  }
}
