use crate::m20230601_025202_create_recipes::Recipe;
use sea_orm::{EnumIter, Iterable};
use sea_orm_migration::{prelude::*, sea_query::extension::postgres::Type};

#[derive(Iden, EnumIter)]
pub enum Measurement {
  Table,
  Grams,
  Millilitres,
  Milligrams,
  Kilograms,
  Litres,
}

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    // Replace the sample below with your own migration scripts

    manager
      .create_type(
        Type::create()
          .as_enum(Measurement::Table)
          .values(Measurement::iter().skip(1))
          .to_owned(),
      )
      .await?;

    manager
      .create_table(
        Table::create()
          .table(Ingredient::Table)
          .if_not_exists()
          .col(
            ColumnDef::new(Ingredient::Id)
              .integer()
              .not_null()
              .auto_increment()
              .primary_key(),
          )
          .col(ColumnDef::new(Ingredient::Name).string().not_null())
          .col(ColumnDef::new(Ingredient::Amount).integer().not_null())
          .col(
            ColumnDef::new(Ingredient::Measurement)
              .enumeration(Measurement::Table, Measurement::iter().skip(1))
              .not_null(),
          )
          .col(ColumnDef::new(Ingredient::RecipeId).integer().not_null())
          .foreign_key(
            ForeignKey::create()
              .name("fk-ingredient-recipe_id")
              .from(Ingredient::Table, Ingredient::RecipeId)
              .to(Recipe::Table, Recipe::Id),
          )
          .to_owned(),
      )
      .await
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    // Replace the sample below with your own migration scripts

    manager
      .drop_table(Table::drop().table(Ingredient::Table).to_owned())
      .await
  }
}

/// Learn more at https://docs.rs/sea-query#iden
#[derive(Iden)]
pub enum Ingredient {
  Table,
  Id,
  Name,
  Amount,
  Measurement,
  RecipeId,
}
