export class UsersEntity {
  constructor(
    public id: number,
    public name: string,
    public email: string,
    public password: string,
    public roleId: number,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}

  get isValid(): boolean {
    return this.email.includes('@') && this.roleId > 0;
  }

  public static fromObject(object: { [key: string]: any }): UsersEntity {
    const { id, name, email, password, roleId, createdAt, updatedAt } = object;
    if (!id) throw new Error('Id is required');
    return new UsersEntity(id, name, email, password, roleId, createdAt, updatedAt);
  }
}
