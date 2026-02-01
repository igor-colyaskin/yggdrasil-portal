using {com.epic.yggdrasil as db} from '../db/schema';

// HR Сервис (OData v4) - Наш "Overview"
service HRService @(path: '/odata/v4/hr') {
    entity Staff       as projection on db.Employees;
    entity Departments as projection on db.Departments; // Даем доступ к справочнику
}

// Финансовый сервис (Будем имитировать OData v2)
service FinanceService @(path: '/finance') {
    entity Payrolls as projection on db.Payrolls;
    entity Assets   as projection on db.TechnicalAssets;
}

service ProjectService @(path: '/odata/v4/projects') {
    // Для Registry
    entity Projects    as projection on db.Projects;

    // Для Assignments и деталей проекта
    entity Assignments as projection on db.ProjectAssignments;
}

service PortalService @(path: '/odata/v4/portal') {
    entity RolePages as projection on db.PortalRoles;
    entity Pages     as projection on db.PortalPages;
}
