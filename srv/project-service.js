const cds = require('@sap/cds');

module.exports = cds.service.impl(async function() {
    this.on('READ', 'Projects', async (req, next) => {
        const data = await next();
        return data; // Здесь можно модифицировать структуру под нужды REST
    });

    this.on('READ', 'Assignments', async (req) => {
        // Логика фильтрации: по сотруднику или по проекту
        return await SELECT.from('com.epic.yggdrasil.ProjectAssignments');
    });
});