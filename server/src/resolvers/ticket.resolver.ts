import { Ticket } from '../entities/Ticket';
import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql';
import { isAuth } from '../middleware/isAuth';
import { TicketCreateInput } from '../types/ticket.types';
import { User } from '../entities/User';
import { MyContext } from '../types/context.types';
import { jwtVerify } from '../utils/jwtVerify';
import { File } from '../entities/File';

@Resolver()
export class TicketResolver {
  @Mutation(() => Ticket)
  @UseMiddleware(isAuth)
  async createTicket(
    @Arg('ticket')
    {
      subject,
      fileIds,
      description,
      priority,
      product,
      status,
    }: TicketCreateInput,
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
}
