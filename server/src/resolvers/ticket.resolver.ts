import { Ticket } from '../entities/Ticket';
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { isAuth } from '../middleware/isAuth';
import { TicketInput } from '../types/ticket.types';
import { User } from '../entities/User';
import { MyContext } from '../types/context.types';
import { jwtVerify } from '../utils/jwtVerify';
import { File } from '../entities/File';
import { getConnection } from 'typeorm';

@Resolver()
export class TicketResolver {
  @Mutation(() => Ticket)
  @UseMiddleware(isAuth)
  async createTicket(
    @Arg('ticket')
    { subject, fileIds, description, priority, product, status }: TicketInput,
    @Ctx() { req }: MyContext
  ): Promise<Ticket> {
    const user = await User.findOne(jwtVerify(req));

    const ticket = Ticket.create({
      subject,
      description,
      priority,
      product,
      status,
      creator: user,
    });
    if (fileIds) {
      const files = await File.findByIds(fileIds);
      if (files) {
        ticket.files = files;
      }
    }
    await ticket.save();
    return ticket;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async assignTicket(
    @Arg('ticketId', () => String) ticketId: string,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    const ticket = await Ticket.findOne(ticketId);
    const user = await User.findOne(jwtVerify(req));
    if (!ticket) {
      return false;
    }
    if (user?.role !== 'admin' || 'staff') {
      return false;
    }
    ticket.staff = user;
    return true;
  }

  @Mutation(() => Ticket)
  @UseMiddleware(isAuth)
  async updateTicket(
    @Arg('ticketId', () => String) ticketId: string,
    @Arg('ticket')
    { subject, fileIds, description, priority, product, status }: TicketInput
  ): Promise<Ticket | undefined> {
    const ticket = await Ticket.findOne(ticketId, { relations: ['files'] });
    if (!ticket) {
      throw new Error('ticket not found');
    }

    let files: File[] = [];
    if (fileIds) {
      const currentIds = ticket.files.map((file) => file.id);
      const allIds = [...currentIds, ...fileIds];
      fileIds = allIds.filter((id) => !currentIds.includes(id));
      fileIds = Array.from(new Set(fileIds));
      files = await File.findByIds(fileIds);
      if (files) {
        await getConnection()
          .createQueryBuilder()
          .relation(Ticket, 'files')
          .of(ticket)
          .add(files);
      }
    }
    const result = await getConnection()
      .createQueryBuilder()
      .relation(Ticket, 'files')
      .of(ticketId)
      .update(Ticket)
      .set({
        subject,
        description,
        priority,
        product,
        status,
      })
      .where('id = :id', { id: ticketId })
      .returning('*')
      .execute();
    console.log(result.raw);
    return Ticket.findOne(ticketId, { relations: ['files'] });
  }

  //   paginate the two queries`
  @Query(() => [Ticket])
  @UseMiddleware(isAuth)
  tickets(): Promise<Ticket[]> {
    return Ticket.find({ relations: ['files'] });
  }

  @Query(() => [Ticket])
  @UseMiddleware(isAuth)
  async assignedTickets(@Ctx() { req }: MyContext): Promise<Ticket[]> {
    const user = await User.findOne(jwtVerify(req));
    return Ticket.find({ where: { staff: user }, relations: ['files'] });
  }

  @Query(() => Ticket)
  @UseMiddleware(isAuth)
  async getTicket(
    @Arg('ticketId', () => String) ticketId: string
  ): Promise<Ticket | undefined> {
    console.log(await Ticket.findOne(ticketId));
    return Ticket.findOne(ticketId, { relations: ['files'] });
  }
}
