namespace com.epic.yggdrasil;

using {
    managed,
    cuid
} from '@sap/cds/common';

// --- СИСТЕМА 1: HR Portal (Основные данные) ---
entity Employees : cuid, managed {
    name       : String(100);
    department : String(50); // IT, Finance, HR
    position   : String(50); // Senior Developer, HR Manager
    email      : String(100);
    level      : String(10); // Junior, Middle, Senior
}

// --- СИСТЕМА 2: Finance & Assets (Бухгалтерия и Техника) ---
entity Payrolls : cuid {
    employeeId : UUID; // Ссылка на Employees.id
    salary     : Decimal(15, 2);
    currency   : String(3) default 'RUB';
    equipment  : Composition of many TechnicalAssets
                     on equipment.owner = $self;
}

entity TechnicalAssets : cuid {
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
