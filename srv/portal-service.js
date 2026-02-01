const cds = require('@sap/cds')

module.exports = class PortalService extends cds.ApplicationService {
    init() {
        // Регистрируем обработчик для нашей функции getSchema
        this.on('getSchema', async (req) => {
            const { entity } = req.data // Получаем имя сущности из запроса
            console.log("Доступные сущности:", Object.keys(cds.entities))
            // 1. Ищем описание сущности в общей модели проекта
            // cds.entities содержит все таблицы и сервисы, которые видит CAP
            const ENTITY_MAP = {
                "Staff": "HRService.Staff",
                "Projects": "ProjectService.Projects",
                "Assignments": "ProjectService.Assignments"
            }

            // И в обработчике:
            const internalName = ENTITY_MAP[entity] || entity
            const target = cds.entities[internalName]

            if (!target) {
                return req.error(404, `Сущность ${entity} не найдена в модели Yggdrasil`)
            }

            // 2. Формируем наш легкий "экстракт"
            const fields = []

            // target.elements — это объект со всеми полями таблицы
            for (let name in target.elements) {
                const element = target.elements[name]

                // Пропускаем технические поля (ассоциации и системные ключи), 
                // которые не нужны пользователю в фильтре или таблице
                if (element.type === 'cds.Association' || name.startsWith('up_')) continue

                fields.push({
                    id: name,
                    label: element['@Common.Label'] || name, // Берем красивое имя из метаданных или ID
                    type: this._mapType(element.type),       // Превращаем тип БД в тип для UI
                    filterable: true
                })
            }

            // Возвращаем результат как строку JSON
            return JSON.stringify(fields)
        })

        return super.init()
    }

    // Вспомогательный метод для маппинга типов
    _mapType(cdsType) {
        const m = {
            'cds.String': 'Search',
            'cds.Date': 'Date',
            'cds.Boolean': 'Boolean',
            'cds.Integer': 'Number'
        }
        return m[cdsType] || 'Search'
    }
}