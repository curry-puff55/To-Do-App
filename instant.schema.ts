import { i } from '@instantdb/react';

const _schema = i.schema({
  entities: {
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
    }),
    lists: i.entity({
      title: i.string(),
      description: i.string().optional(),
      tags: i.json(), // Array of strings
      public: i.boolean(),
      createdAt: i.number().indexed(),
      updatedAt: i.number().indexed(),
    }),
    tasks: i.entity({
      title: i.string(),
      description: i.string().optional(),
      status: i.string(), // "pending" | "complete"
      priority: i.string(), // "high" | "medium" | "low"
      dueDate: i.string().optional(),
      createdAt: i.number().indexed(),
      order: i.number().indexed(), // For ordering tasks within a list
    }),
  },
  links: {
    listOwner: {
      forward: { on: 'lists', has: 'one', label: 'owner' },
      reverse: { on: '$users', has: 'many', label: 'lists' },
    },
    listTasks: {
      forward: { on: 'tasks', has: 'one', label: 'list' },
      reverse: { on: 'lists', has: 'many', label: 'tasks' },
    },
  },
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
