use sea_orm_migration::{prelude::*, sea_orm::prelude::DateTimeLocal};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    // Replace the sample below with your own migration scripts

    manager
      .create_table(
        Table::create()
          .table(SignInCode::Table)
          .if_not_exists()
          .col(
            ColumnDef::new(SignInCode::Id)
              .integer()
              .not_null()
              .auto_increment()
              .primary_key(),
          )
          .col(ColumnDef::new(SignInCode::EmailAddress).string().not_null())
          .col(ColumnDef::new(SignInCode::Code).string().not_null())
          .col(ColumnDef::new(SignInCode::CreatedAt).timestamp().not_null())
          .to_owned(),
      )
      .await
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    // Replace the sample below with your own migration scripts

    manager
      .drop_table(Table::drop().table(SignInCode::Table).to_owned())
      .await
  }
}

/// Learn more at https://docs.rs/sea-query#iden
#[derive(Iden)]
enum SignInCode {
  Table,
  Id,
  EmailAddress,
  Code,
  CreatedAt,
}
