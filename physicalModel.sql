-- create the database and use the database
use master;
go 
drop database Pittervention;
go 
create database Pittervention;
go
use Pittervention;

-- create tables 
-- NEED A CHECK CONSTRAINT ON PASSWORD 

create table Login (
LID int identity primary key, 
username nvarchar(50) not null unique,
password text not null
);

create table Badge (
BID int identity primary key,
badgeName nvarchar(50) not null unique, 
path varchar(1000) not null unique
);

create table LoginBadges (
LBID int identity primary key,
LID int not null references Login(LID),
BID int not null references Badge(BID)
);

create table Entry (
EID int identity primary key,
ACTC nvarchar(1) not null,
tutoring nvarchar(1) not null,
writing nvarchar(1) not null,
math nvarchar(1) not null,
trio nvarchar(1) not null,
officeHours nvarchar(1) not null,
studyGroup nvarchar(1) not null,
meditation nvarchar(1) not null,
tao nvarchar(1) not null,
togetherAll nvarchar(1) not null,
therapy nvarchar(1) not null,
medication nvarchar(3) not null,
exercise nvarchar(6) not null,
sleep decimal(4,2) not null,
LID int references Login(LID)
);

-- Stored Procedures



select * from Login;
select * from Entry;