namespace com.epic.yggdrasil;

using {
    managed,
    cuid
} from '@sap/cds/common';

// --- СИСТЕМА 1: HR Portal (Основные данные) ---
entity Employees : managed {
    key ID       : String(36);
        name     : String(100);
        dept     : Association to Departments;
        position : String(50); // Senior Developer, HR Manager
        email    : String(100);
        level    : String(10); // Junior, Middle, Senior
}

// Сущность отделов
entity Departments {
    key ID          : String(36);
        name        : String(50);
        description : String(100);
}

// --- СИСТЕМА 2: Finance & Assets (Бухгалтерия и Техника) ---
entity Payrolls {
    key ID         : String(36);
        employeeId : String(36); // Ссылка на Employees.id
        salary     : Decimal(15, 2);
        currency   : String(3) default 'RUB';
        equipment  : Composition of many TechnicalAssets
                         on equipment.owner = $self;
}

entity TechnicalAssets {
    key ID        : String(36);
        owner     : Association to Payrolls;
        type      : String(20); // Laptop, Monitor, Phone
        model     : String(50);
        serialNum : String(30);
}

// --- СИСТЕМА 3: Project Office (Загрузка в проектах) ---
entity ProjectAssignments : cuid {
    employeeId    : UUID;
    projectName   : String(100);
    roleInProject : String(50);
    utilization   : Integer; // % загрузки (например, 50 или 100)
}

// --- СИСТЕМА 4: Coworking (Бронирование мест) ---
entity Bookings : cuid {
    employeeId : UUID;
    deskNumber : String(10);
    date       : Date;
}
