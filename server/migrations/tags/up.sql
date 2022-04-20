CREATE TABLE IF NOT EXISTS tags (
  tag text,
  auto tinyint default 0,
  unique (tag collate nocase)
);
