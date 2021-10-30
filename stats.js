//const APP_ID = A7D622A8-681A-417D-BBE2-4E30B74EA010;
function quantile(arr, q) {
    const sorted = arr.sort((a, b) => a - b);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;

    if (sorted[base + 1] !== undefined) {
        return Math.floor(sorted[base] + rest * (sorted[base + 1] - sorted[base]));
    } else {
        return Math.floor(sorted[base]);
    }
};

function prepareData(result) {
	return result.data.map(item => {
		item.date = item.timestamp.split('T')[0];

		return item;
	});
}
function getMetric(sampleData) {
	let result = {};

	result.hits = sampleData.length;
	result.p25 = quantile(sampleData, 0.25);
	result.p50 = quantile(sampleData, 0.5);
	result.p75 = quantile(sampleData, 0.75);
	result.p95 = quantile(sampleData, 0.95);

	return result;
}

function showMetricTable(calledFunc, params ) {
	let table = {};
	table.connect = calledFunc(params.data, params.page, 'connect', params.date);
	table.ttfb = calledFunc(params.data, params.page, 'ttfb', params.date);
	table.load = calledFunc(params.data, params.page, 'load', params.date);
	table.ttfb = calledFunc(params.data, params.page, 'ttfb', params.date);
	table.fcp = calledFunc(params.data, params.page, 'fcp', params.date);//первая отрисовка контента
	table.lcp = calledFunc(params.data, params.page, 'lcp', params.date);//скорость загрузки основного контента
	table.fid = calledFunc(params.data, params.page, 'fid', params.date);//время ожидания до 1го взаимодействия
	//table.tti = calledFunc(params.data, params.page, 'tti', params.date);//время до интеративности

	return table;
}


function showMetricByPeriod(data, page, name, period ) {
	let sampleData = data
					.filter(item => item.page == page && item.name == name &&
									item.date <= period.end && item.date >= period.start)
					.map(item => item.value);
	
	let result = getMetric(sampleData);
	return result;
}

// рассчитывает все метрики за период
function calcMetricsByPeriod(data, page, period) {
	console.log('period', period)
	console.log(`All metrics for period from ${period.start} to ${period.end}:`);
	
	let table = showMetricTable(showMetricByPeriod, {data: data, page: page, date: period});
	console.table(table);
};

// показать сессию пользователя
function showSession() {
	console.log(`Session ${APP_ID}`);
}


function getMetricByBrowser(data, page, browser, name) {
	console.log(`get metric ${name} for browser ${browser}`)
	let sampleData = data
						.filter(item => item.page == page &&
										item.additional.browser === browser &&
										item.name == name).map(item => item.value);;
	let result = getMetric(sampleData);
	let table = {};
	table[name] =result;

	console.table(table)
	return result;
}


function addMetricByDate(data, page, name, date) {
	let sampleData = data
					.filter(item => item.page == page && item.name == name && item.date == date)
					.map(item => item.value);

	let result = getMetric(sampleData);
	//console.log("res in add", sampleData)

	return result;
}

// сравнить метрику в разных срезах
function compareMetric(data, page, metric, slice_1, slice_2) {
	console.log(`Compare metric ${metric} in slice ${slice_1} and ${slice_2} `);
	const metric1 = addMetricByDate(data, page, metric, slice_1);
	const metric2 = addMetricByDate(data, page, metric, slice_2);
	
	let table = {};	
	table[slice_1] = metric1; 
	table[slice_2] = metric2;
	
	console.table(table);
}

// рассчитывает все метрики за день
function calcMetricsByDate(data, page, date) {
	console.log(`All metrics for ${date}:`);

	let table = showMetricTable(addMetricByDate, {data: data, page: page, date: date});

	console.table(table);
};
fetch(`https://shri.yandex/hw/stat/data?counterId=A7D622A8-681A-417D-BBE2-4E30B74EA010`)
	.then(res => res.json())
	.then(result => {
		let data = prepareData(result);

		calcMetricsByDate(data, 'send test', '2021-10-30');
		compareMetric(data, 'send test', 'lcp', '2021-10-30', '2021-10-29');
		getMetricByBrowser(data, 'send test', 'other', 'fcp')
		// добавить свои сценарии, реализовать функции выше
	});
