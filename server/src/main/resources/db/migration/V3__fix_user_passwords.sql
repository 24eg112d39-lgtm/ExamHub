-- Fix passwords for seeded invigilators and students to Admin@123
UPDATE users
SET password = '$2a$10$vMWAU6QCFJl.sZNy/HMOg.jy24WrPjvXjnxFXO18f6TLDKjyAysM2'
WHERE role IN ('INVIGILATOR', 'STUDENT');
