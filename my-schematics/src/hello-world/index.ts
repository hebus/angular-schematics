import { normalize, strings, virtualFs, workspaces } from '@angular-devkit/core';
import { apply, chain, MergeStrategy, mergeWith, move, Rule, SchematicsException, template, Tree, url } from '@angular-devkit/schematics';

import { Schema as HelloWorldSchema } from './schema';

function createHost(tree: Tree): workspaces.WorkspaceHost {
  return {
    async readFile(path: string): Promise<string> {
      const data = tree.read(path);
      if (!data) {
        throw new SchematicsException('File not found.');
      }
      return virtualFs.fileBufferToString(data);
    },
    async writeFile(path: string, data: string): Promise<void> {
      return tree.overwrite(path, data);
    },
    async isDirectory(path: string): Promise<boolean> {
      return !tree.exists(path) && tree.getDir(path).subfiles.length > 0;
    },
    async isFile(path: string): Promise<boolean> {
      return tree.exists(path);
    },
  };
}

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function helloWorld(_options: HelloWorldSchema): Rule {
  return async (tree: Tree) => {
    const host = createHost(tree);
    const { workspace } = await workspaces.readWorkspace('/', host);

    const project = (_options.project != null) ? workspace.projects.get(_options.project) : null;
    if (!project) {
      throw new SchematicsException(`Invalid project name: ${_options.project}`);
    }

    // const projectType = project.extensions.projectType === 'application' ? 'app' : 'lib';
    if (_options.path === undefined) {
      // _options.path = `${project.sourceRoot}/${projectType}`;
      _options.path = `${project.sourceRoot}`;
    }

    const templateSource = apply(url('./files'), [
      template({
        classify: strings.classify,
        dasherize: strings.dasherize,
        ..._options,
        uppercase: (s:string) => s.toUpperCase()
      }),
      move(normalize(_options.path as string))
    ]);

    return chain([
      mergeWith(templateSource, MergeStrategy.Overwrite)
    ]);
  };
}
