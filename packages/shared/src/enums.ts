export enum AccountStatus {
  ACTIVE = "ACTIVE",
  BANNED = "BANNED",
}

export enum BookCondition {
  NEW = "NEW",
  GOOD = "GOOD",
  WORN = "WORN",
  DAMAGED = "DAMAGED",
  LOST = "LOST",
}

export enum BookStatus {
  AVAILABLE = "AVAILABLE",
  BORROWED = "BORROWED",
}

export enum LoanStatus {
  BORROWED = "BORROWED",
  RETURNED = "RETURNED",
  OVERDUE = "OVERDUE",
}

export enum Role {
  ADMIN = "ADMIN",
  LIBRARIAN = "LIBRARIAN",
  MEMBER = "MEMBER",
}
