import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../collection.json');

describe('hello-world', () => {
  const schematicTestRunner = new SchematicTestRunner('schematics', collectionPath);
  const workspaceOptions: any = {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '0.5.0',
  };

  const appOptions: any = {
    name: 'schemaTest'
  };

  const schemaOptions: any = {
    name: 'foo',
    surname: 'bar',
    project: 'schemaTest'
  };

  let appTree: UnitTestTree;

  beforeEach(async () => {
    appTree = await schematicTestRunner.runExternalSchematic('@schematics/angular', 'workspace', workspaceOptions);
    appTree = await schematicTestRunner.runExternalSchematic('@schematics/angular', 'application', appOptions, appTree)
  });

  it('works', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const _tree = await runner.runSchematic('hello-world', schemaOptions, appTree);

    const appComponent = _tree.readContent('/projects/schema-test/src/app/app.component.ts');
    expect(appComponent).toContain(`name = '${schemaOptions.name}'`);
    expect(appComponent).toContain(`surname = '${schemaOptions.surname.toUpperCase()}'`);
  });

});
