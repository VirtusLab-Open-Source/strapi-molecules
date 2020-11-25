import { KoaContext, SupportMethods } from '../../middlewares/audit-log/types';
import { AvailableAction } from '..';
import { Base } from './Base';


export class ContentManager extends Base {
  async run(method: SupportMethods, ctx: KoaContext) {
    const cleaningData = this.sanitize(this.entities);
    switch (method) {
      case 'PUT': {
        const { fetch: beforeUpdate, edit: afterUpdate } = cleaningData;
        const diffs = this.getDiff(beforeUpdate, afterUpdate);
        await this.save(
          beforeUpdate.id,
          AvailableAction.UPDATE,
          ctx.params.model,
          diffs,
        );
        break;
      }
      case 'POST': {
        const diffs = this.getDiff({}, cleaningData.create);
        await this.save(
          cleaningData.create.id,
          AvailableAction.CREATE,
          ctx.params.model,
          diffs,
        );
        break;
      }
      case 'DELETE': {
        if (cleaningData.delete) {
          const diffs = this.getDiff(cleaningData.delete, {});
          await this.save(
            cleaningData.delete.id,
            AvailableAction.DELETE,
            ctx.params.model,
            diffs,
          );
        }
        if (cleaningData.deleteMany) {
          await Promise.all(cleaningData.deleteMany.map((_: any) => {
            const diffs = this.getDiff(_, {});
            return this.save(
              _.id,
              AvailableAction.DELETE,
              ctx.params.model,
              diffs,
            );
          }));
        }
        break;
      }
    }
  }
}
