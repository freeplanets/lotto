function test(param: any) {
  const Account: string = `${param.Account}`;
  const Password: string = `${param.Password}`;
  const UserID: number = param.UserID ? parseInt(param.UserID as string, 10) : 0;
  console.log(Account, Password, UserID);
}
