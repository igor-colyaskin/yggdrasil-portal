using {com.epic.yggdrasil as db} from '../db/schema';

// HR Сервис (OData v4) - Наш "Overview"
service HRService @(path: '/odata/v4/hr') {
    entity Staff as projection on db.Employees;
}

// Финансовый сервис (Будем имитировать OData v2)
service FinanceService @(path: '/odata/v2/finance') {
    entity Payrolls as projection on db.Payrolls;
    entity Assets   as projection on db.TechnicalAssets;
}

// Производственный сервис (Для карточек проектов)
service ProjectService @(path: '/odata/v4/projects') {
    entity Assignments as projection on db.ProjectAssignments;
}
