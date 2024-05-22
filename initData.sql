-- drop schema service_exam;
-- create schema service_exam;

INSERT INTO par_category (id, name, createdAt, updatedAt)
VALUES ('9f853331-b053-11ee-ae0b-6df37d9883c6', 'subject', now(), now());

INSERT INTO par_category (id, name, createdAt, updatedAt)
VALUES ('9f859f5b-b053-11ee-ae0b-6df37d9883c6', 'level', now(), now());

INSERT INTO par_category (id, name, createdAt, updatedAt)
VALUES ('9f860eae-b053-11ee-ae0b-6df37d9883c6', 'grade', now(), now());


INSERT INTO category (id, id_par_category, name, createdAt, updatedAt)
VALUES ('3cd5d9e5-b054-11ee-ae0b-6df37d9883c6', '9f853331-b053-11ee-ae0b-6df37d9883c6', 'Toán' ,now(), now());

INSERT INTO category (id, id_par_category, name, createdAt, updatedAt)
VALUES ('3cd63b70-b054-11ee-ae0b-6df37d9883c6', '9f853331-b053-11ee-ae0b-6df37d9883c6', 'Lý' ,now(), now());

INSERT INTO category (id, id_par_category, name, createdAt, updatedAt)
VALUES ('3cd69adb-b054-11ee-ae0b-6df37d9883c6', '9f853331-b053-11ee-ae0b-6df37d9883c6', 'Hóa' ,now(), now());

INSERT INTO category (id, id_par_category, name, createdAt, updatedAt)
VALUES ('3cd6ff37-b054-11ee-ae0b-6df37d9883c6', '9f853331-b053-11ee-ae0b-6df37d9883c6', 'Văn' ,now(), now());
																											
INSERT INTO category (id, id_par_category, name, createdAt, updatedAt)
VALUES ('3cd754be-b054-11ee-ae0b-6df37d9883c6', '9f853331-b053-11ee-ae0b-6df37d9883c6', 'Sinh' ,now(), now());

INSERT INTO category (id, id_par_category, name, createdAt, updatedAt)
VALUES ('3cd7b54f-b054-11ee-ae0b-6df37d9883c6', '9f853331-b053-11ee-ae0b-6df37d9883c6', 'Sử' ,now(), now());

INSERT INTO category (id, id_par_category, name, createdAt, updatedAt)
VALUES ('3cd810b9-b054-11ee-ae0b-6df37d9883c6', '9f853331-b053-11ee-ae0b-6df37d9883c6', 'Địa' ,now(), now());

INSERT INTO category (id, id_par_category, name, createdAt, updatedAt)
VALUES ('3cd868ac-b054-11ee-ae0b-6df37d9883c6', '9f853331-b053-11ee-ae0b-6df37d9883c6', 'Anh Văn' ,now(), now());

INSERT INTO category (id, id_par_category, name, createdAt, updatedAt)
VALUES ('3cd8bb2d-b054-11ee-ae0b-6df37d9883c6', '9f853331-b053-11ee-ae0b-6df37d9883c6', 'Giáo dục công dân' ,now(), now());


INSERT INTO category (id, id_par_category, name, createdAt, updatedAt)
VALUES ('3cd91216-b054-11ee-ae0b-6df37d9883c6', '9f859f5b-b053-11ee-ae0b-6df37d9883c6', 'Nâng cao' ,now(), now());

INSERT INTO category (id, id_par_category, name, createdAt, updatedAt)
VALUES ('3cd960ca-b054-11ee-ae0b-6df37d9883c6', '9f859f5b-b053-11ee-ae0b-6df37d9883c6', 'Trung bình' ,now(), now());
																										
INSERT INTO category (id, id_par_category, name, createdAt, updatedAt)
VALUES ('3cd9ad1d-b054-11ee-ae0b-6df37d9883c6', '9f859f5b-b053-11ee-ae0b-6df37d9883c6', 'Cơ bản' ,now(), now());


INSERT INTO category (id, id_par_category, name, createdAt, updatedAt)
VALUES ('3cd9fbb5-b054-11ee-ae0b-6df37d9883c6', '9f860eae-b053-11ee-ae0b-6df37d9883c6', 'Lớp 10' ,now(), now());

INSERT INTO category (id, id_par_category, name, createdAt, updatedAt)
VALUES ('3cda5720-b054-11ee-ae0b-6df37d9883c6', '9f860eae-b053-11ee-ae0b-6df37d9883c6', 'Lớp 11' ,now(), now());

INSERT INTO category (id, id_par_category, name, createdAt, updatedAt)
VALUES ('3cdaa92d-b054-11ee-ae0b-6df37d9883c6', '9f860eae-b053-11ee-ae0b-6df37d9883c6', 'Lớp 12' ,now(), now());



INSERT INTO exam (id, id_teacher, id_course, title, period, quantity_question, createdAt, updatedAt)
VALUES ('60d3da0d-b054-11ee-ae0b-6df37d9883c6', '9f860eae-b053-11ee-ae0b-6df37d9883c6', '3cd5d9e5-b054-11ee-ae0b-6df37d9883c6' , 'tet1', '30:00', 20, now(), now());

INSERT INTO `category-exam` (id_exam, id_category, createdAt, updatedAt)
VALUES ('60d3da0d-b054-11ee-ae0b-6df37d9883c6', '3cd9fbb5-b054-11ee-ae0b-6df37d9883c6', now(), now());


INSERT INTO question(id, id_teacher, content_text, createdAt, updatedAt) VALUES ('60d3da2d-b054-11ee-ae0b-6df37d9883c6', '60d3da0d-b054-11ee-ae0b-6df37d9883c6', 'cau hoi 1', now(), now());

INSERT INTO question(id, id_teacher, content_text, createdAt, updatedAt) VALUES ('60d3da3d-b054-11ee-ae0b-6df37d9883c6', '60d3da0d-b054-11ee-ae0b-6df37d9883c6', 'cau hoi 2', now(), now());


INSERT INTO `exam-question`(id_exam, id_question, createdAt, updatedAt) VALUES ('60d3da0d-b054-11ee-ae0b-6df37d9883c6', '60d3da2d-b054-11ee-ae0b-6df37d9883c6', now(), now());

INSERT INTO `exam-question`(id_exam, id_question, createdAt, updatedAt) VALUES ('60d3da0d-b054-11ee-ae0b-6df37d9883c6', '60d3da3d-b054-11ee-ae0b-6df37d9883c6', now(), now());



INSERT INTO answer(id, id_question, content_text, is_correct, createdAt, updatedAt) VALUES (uuid(), '60d3da2d-b054-11ee-ae0b-6df37d9883c6', 'dap an 1', true, now(), now());

INSERT INTO answer(id, id_question, content_text, is_correct, createdAt, updatedAt) VALUES (uuid(), '60d3da2d-b054-11ee-ae0b-6df37d9883c6', 'dap an 2', false, now(), now());

INSERT INTO answer(id, id_question, content_text, is_correct, createdAt, updatedAt) VALUES (uuid(), '60d3da2d-b054-11ee-ae0b-6df37d9883c6', 'dap an 3', false, now(), now());

INSERT INTO answer(id, id_question, content_text, is_correct, createdAt, updatedAt) VALUES (uuid(), '60d3da2d-b054-11ee-ae0b-6df37d9883c6', 'dap an 4', false, now(), now());

INSERT INTO answer(id, id_question, content_text, is_correct, createdAt, updatedAt) VALUES (uuid(), '60d3da3d-b054-11ee-ae0b-6df37d9883c6', 'dap an 5', false, now(), now());

INSERT INTO answer(id, id_question, content_text, is_correct, createdAt, updatedAt) VALUES (uuid(), '60d3da3d-b054-11ee-ae0b-6df37d9883c6', 'dap an 8', true, now(), now());

INSERT INTO answer(id, id_question, content_text, is_correct, createdAt, updatedAt) VALUES (uuid(), '60d3da3d-b054-11ee-ae0b-6df37d9883c6', 'dap an 6', false, now(), now());

INSERT INTO answer(id, id_question, content_text, is_correct, createdAt, updatedAt) VALUES (uuid(), '60d3da3d-b054-11ee-ae0b-6df37d9883c6', 'dap an 7', false, now(), now());

