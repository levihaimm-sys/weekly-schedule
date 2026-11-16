-- Activity type requested by the client for a camp day (e.g. תאטרון, תנועה)
alter table camp_requests add column if not exists activity_type text;
