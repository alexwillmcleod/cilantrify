pub use sea_orm_migration::prelude::*;

mod m20230505_014014_create_users;mod m20230525_004403_create_recipes;


pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
  fn migrations() -> Vec<Box<dyn MigrationTrait>> {
    vec![Box::new(m20230505_014014_create_users::Migration)]
  }
}
