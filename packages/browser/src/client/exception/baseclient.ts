import { Client } from '../client';
import { Options } from '../../types/options';

export abstract class BaseClient<B extends Backend, O extends Options> implements Client {

}