package com.example.backend.config;

// Use the community dialect from hibernate

public class SQLiteDialect extends org.hibernate.community.dialect.SQLiteDialect {
    // Using the community SQLiteDialect from Hibernate 6.x
    // No need to implement custom methods as they are already in the parent class
}
