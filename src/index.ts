import { toSchema, initDb } from '@mavvy/mgql';
import mongoose from 'mongoose';

const pluginName = 'minigql-plugin-mongoose';

type PluginOptions = {
  models: any[];
  context?: ({ req }: { req: any }) => Promise<any>;
};

const applyContext =
  (context: PluginOptions['context']) =>
  async ({ req }: { req: any }) => {
    if (context) {
      return context({ req });
    }
    return undefined;
  };

const createResolverParam = (models: PluginOptions['models']) => {
  const m = models.reduce(
    (prev, current) => ({
      ...prev,
      [current.name]: () => ({
        db: mongoose.model(current.name),
      }),
    }),
    {},
  );
  return { mongoose, models: m };
};

const createPrestart = (models: PluginOptions['models']) => {
  return initDb({ models, uri: process.env.MONGO_URI! });
};

export default function ({ models, context }: PluginOptions) {
  const schema = toSchema(models);
  const pluginContext = applyContext(context);
  const resolverParam = createResolverParam(models);
  const preStart = createPrestart(models);

  return {
    name: pluginName,
    schema,
    context: pluginContext,
    resolverParam,
    preStart,
  };
}
