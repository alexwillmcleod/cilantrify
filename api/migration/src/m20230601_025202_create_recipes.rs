use crate::m20230505_014014_create_users::User;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    // Replace the sample below with your own migration scripts

    manager
      .create_table(
        Table::create()
          .table(Recipe::Table)
          .if_not_exists()
          .col(
            ColumnDef::new(Recipe::Id)
              .integer()
              .not_null()
              .auto_increment()
              .primary_key(),
          )
          .col(ColumnDef::new(Recipe::Title).string().not_null())
          .col(
            ColumnDef::new(Recipe::Instructions)
              .array(crate::ColumnType::Text)
              .not_null(),
          )
          .col(ColumnDef::new(Recipe::AuthorId).integer().not_null())
          .foreign_key(
            ForeignKey::create()
              .name("fk-recipe-author_id")
              .from(Recipe::Table, Recipe::AuthorId)
              .to(User::Table, User::Id),
          )
          .to_owned(),
      )
      .await
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    // Replace the sample below with your own migration scripts

    manager
      .drop_table(Table::drop().table(Recipe::Table).to_owned())
      .await
  }
}

/// Learn more at https://docs.rs/sea-query#iden
#[derive(Iden)]
pub enum Recipe {
  Table,
  Id,
  Title,
  Ingredients,
  Instructions,
  AuthorId,
}
