CREATE virtual TABLE IF NOT EXISTS files_search USING FTS5('path', body);

DELETE FROM files_search;

INSERT INTO files_search ('path', body)
SELECT
  files.path,
  (
    files.path || ' ' ||
    ifnull(json_extract(iptc, '$.object_name'), '') || ' ' ||
    ifnull(json_extract(iptc, '$.caption'), '') || ' ' ||
    ifnull(json_extract(iptc, '$.city'), '') || ' ' ||
    ifnull(json_extract(iptc, '$.sub_location'), '') || ' ' ||
    ifnull(json_extract(iptc, '$.country_or_primary_location_code'), '') || ' ' ||
    ifnull(json_extract(iptc, '$.country_or_primary_location_name'), '') || ' ' ||
    ifnull(json_extract(iptc, '$.copyright_notice'), '') || ' ' ||
    ifnull(json_extract(exif, '$.image.Software'), '') || ' ' ||
    ifnull(tags_concat.tags_list, '')
  ) AS body2
FROM files
LEFT JOIN (
  SELECT files.path, group_concat(ifnull(j.value, ''), ' ') AS tags_list
  FROM files
  JOIN json_each(json_extract(ifnull(files.tags, '[]'), '$')) AS j
  GROUP BY files.path
) AS tags_concat ON files.path = tags_concat.path
  WHERE TRIM(body2) != '';