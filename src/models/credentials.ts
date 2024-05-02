export class KycComplete {
  firstName: string;
  lastName: string;
  email: string;

  constructor(firstName: string, lastName: string, email: string) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
  }
}

export class EmailVerified {
  email: string;

  constructor(email: string) {
    this.email = email;
  }
}
