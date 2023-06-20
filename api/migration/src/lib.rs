pub use sea_orm_migration::prelude::*;

mod m20230505_014014_create_users;
mod m20230601_025202_create_recipes;
mod m20230601_043905_create_ingredients;
mod m20230619_061749_create_sign_in_codes;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
  fn migrations() -> Vec<Box<dyn MigrationTrait>> {
    vec![
      Box::new(m20230505_014014_create_users::Migration),
      Box::new(m20230601_025202_create_recipes::Migration),
      Box::new(m20230601_043905_create_ingredients::Migration),
      Box::new(m20230619_061749_create_sign_in_codes::Migration),
    ]
  }
}
