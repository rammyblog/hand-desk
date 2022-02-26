import { Min } from 'class-validator';
import { ProductEnum, PriorityEnum, StatusEnum } from '../entities/Ticket';
import { InputType, Field } from 'type-graphql';

@InputType()
export class TicketCreateInput {
  @Field()
  @Min(2)
  subject: string;

  @Field()
  product: ProductEnum;

  @Field()
  priority: PriorityEnum;

  @Field()
  @Min(2)
  description: string;

  @Field(() => [Number])
  fileIds?: number[];

  @Field()
  status: StatusEnum;
}
