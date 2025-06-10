import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type adminDocument = Admin & Document;
@Schema()
export class Admin {
  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  adminId: string;
}

export const adminSchema = SchemaFactory.createForClass(Admin);
