import { imm, Imm } from 'ts-imm';
import { CodeBlock } from './CodeBlock';
import { CodeWriter } from './CodeWriter';
import { InterfaceSpec } from './InterfaceSpec';
import { ClassSpec } from './ClassSpec';
import { EnumSpec } from './EnumSpec';
import { FunctionSpec } from './FunctionSpec';
import { Modifier } from './Modifier';
import { PropertySpec } from './PropertySpec';
import { TypeAliasSpec } from './TypeAliasSpec';
import { check } from './utils';


/**
 */
export class NamespaceSpec extends Imm<NamespaceSpec> {

  public static create(name: string): NamespaceSpec {
    return new NamespaceSpec({
      name,
      javaDoc: CodeBlock.empty(),
      members: [],
      modifiers: [],
    })
  }

  @imm
  public readonly name!: string;
  @imm
  public readonly javaDoc!: CodeBlock;
  @imm
  public readonly members!: any[];
  @imm
  public readonly modifiers!: Modifier[];

  public emit(codeWriter: CodeWriter): void {
    codeWriter.emitJavaDoc(this.javaDoc);
    codeWriter.emitModifiers(this.modifiers);
    codeWriter.emitCode('namespace %L {\n', this.name)
    codeWriter.indent();
    let isFirst = true;
    this.members
      .forEach(member => {
        if (isFirst) {
          isFirst = false;
        } else {
          codeWriter.emit('\n');
        }
        if (member instanceof NamespaceSpec) {
          member.emit(codeWriter)
        } else if (member instanceof InterfaceSpec) {
          member.emit(codeWriter);
        } else if (member instanceof ClassSpec) {
          member.emit(codeWriter);
        } else if (member instanceof EnumSpec) {
          member.emit(codeWriter);
        } else if (member instanceof FunctionSpec) {
          member.emit(codeWriter, []);
        } else if (member instanceof PropertySpec) {
          member.emit(codeWriter, [], true);
        } else if (member instanceof TypeAliasSpec) {
          member.emit(codeWriter);
        } else if (member instanceof CodeBlock) {
          codeWriter.emitCodeBlock(member);
        } else if (member instanceof NamespaceSpec) {
          throw new Error('unhandled');
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

  public addClass(classSpec: ClassSpec): this {
    return this.copy({
      members: [...this.members, classSpec],
    });
  }

  public addInterface(ifaceSpec: InterfaceSpec): this {
    return this.copy({
      members: [...this.members, ifaceSpec],
    });
  }

  public addEnum(enumSpec: EnumSpec): this {
    return this.copy({
      members: [...this.members, enumSpec],
    });
  }

  public addFunction(functionSpec: FunctionSpec): this {
    return this.copy({
      members: [...this.members, functionSpec],
    });
  }

  public addProperty(propertySpec: PropertySpec): this {
    return this.copy({
      members: [...this.members, propertySpec],
    });
  }

  public addTypeAlias(typeAliasSpec: TypeAliasSpec): this {
    return this.copy({
      members: [...this.members, typeAliasSpec],
    });
  }

  public addCode(codeBlock: CodeBlock): this {
    return this.copy({
      members: [...this.members, codeBlock],
    });
  }

  public addNamespace(namespaceSpec: NamespaceSpec): this {
    return this.copy({
      members: [...this.members, namespaceSpec],
    });
  }
}
