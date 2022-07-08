import React, { Component, PureComponent } from 'react';
import { View, Image, TouchableOpacity, ScrollView, ImageBackground, Animated, Easing, FlatList, Dimensions, Linking } from 'react-native';
import AppText from './AppText';
import Plot from 'react-plotly.js';
import update from 'immutability-helper';
import AppFetch from './AppFetch';
import Endpoints from '../values/Endpoints';
import AppPicker from './AppPicker';
import Loading from './Loading';
import ReadyWait from './ReadyWait';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import HoverContextMenu from './HoverContextMenu';
import Ionicons from '@expo/vector-icons/Ionicons';
import AppTextInput from './AppTextInput';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import Theme from '../values/Theme';
import * as SecureStore from 'expo-secure-store';
import ObjectSort from './ObjectSort';
import * as Animatable from 'react-native-animatable';
import RandomNumber from './RandomNumber';
import Button from './Button';
import Prometheus from '../images/prom';
import Grafana from '../images/grafana';

import uuid from 'uuid/v4';

class MetricFilters {

    constructor() {
        this.filters = {}
        this.key = 'metric_filters';
    }

    onFilters = async () => null

    get = async () => {
        let data = await SecureStore.getItemAsync(this.key);
        this.filters = JSON.parse(data || `{}`)

        let presets = {
            'cardinality.*high': {
                ts: 498,
                name: 'High Cardinality',
                displaySeparator: true
            },
            'feature.*hockeystick': {
                ts: 499,
                name: 'Hockey-Stick',
                displaySeparator: true
            },
            'feature.*noisy': {
                ts: 499,
                name: 'Noisy'
            },
            'feature.*decreasing': {
                ts: 500,
                name: 'Decreasing'
            },
            'feature.*increasing': {
                ts: 1000,
                name: 'Increasing',
                displaySeparator: true
            },
            'status.*normal': {
                ts: 2000,
                name: 'Cool'
            },
            'status.*warning': {
                ts: 3000,
                name: 'Warm'
            },
            'status.*critical': {
                ts: 4000,
                name: 'Hot',
                displaySeparator: true
            },
            'plot.*scatter': {
                ts: 5000,
                name: 'Scatter',
                priority: 1
            },
            'plot.*timeseries': {
                ts: 6000,
                name: 'Time Series',
                priority: 1
            },
            
        }

        //this.filters = {...this.filters, ...presets}

        let filters = ObjectSort(this.filters, 'ts', 'asc', 'filterCanonical');

        for (let filter in presets) {
            filters.unshift({
                ...presets[filter],
                filter,
                name: presets[filter].name,
                ts: Date.now() + presets[filter].ts,
                preset: true,
            })
        }

        this.onFilters(filters)
        return filters;
    }

    add = async (filter, serverFilter, claims) => {
        let filterCanonical = filter + serverFilter;
        this.filters[filterCanonical] = { filter, serverFilter, ts: Date.now(), ...claims }
        await SecureStore.setItemAsync(this.key, JSON.stringify(this.filters));
        await this.get();
    }

    remove = async (filterCanonical) => {
        delete this.filters[filterCanonical];
        await SecureStore.setItemAsync(this.key, JSON.stringify(this.filters));
        await this.get();
    }

}

class ExecutionQueue {

    constructor(props) {
        this.queue = [];
        this.working = false;
    }

    push = (method) => {
        this.queue.push(method);

        if (this.working) return;
        this.working = true;

        this.work();
    }

    work = async () => {

        if (this.queue.length) {
            await this.queue.shift()();
            this.work();
        } else {
            this.working = false;
        }
    }

}

const executionQueue = new ExecutionQueue();


class ChartData {

    constructor() {

        this.chartPollData = (type, limit) => {
            return {
                output: "charts.children",
                outputs: {
                    id: "charts",
                    property: "children"
                },
                inputs: [
                    {
                        id: "dropdown-types",
                        property: "value", 
                        value: type
                    },
                    {
                        id: "filter",
                        property: "value"
                    },
                    {
                        id: "limit",
                        property: "value",
                        value: limit
                    }
                ],
                changedPropIds: [
                    "dropdown-types.value"
                ]
            }
        }

        this.updateIntervalTime = 8000;

        this.updateInterval = null;

        this.metricConfigKey = 'metric_config';

        this.updateIntervalTimeKey = 'update_interval';

        this.serverSideFilterQuery = '';
        this.autoSimilars = false;
    }

    onChartImageUpdate = async () => null;
    onChartStatusUpdate = async () => null;
    onChartListUpdate = async () => null;
    onChartUpdate = async () => null;
    onUpdateDuration = async () => null;
    onServerMetrics = async () => null;
    onAutoSimilarCharts = async () => null;

    onSetSecondsRemaining = async () => null;

    setUpdateIntervalTime = async (time) => {
        await SecureStore.setItemAsync(this.updateIntervalTimeKey, String(time));
    }

    setServerSideFilter = async (query, notEqual, restart=true) => {

        restart && this.stopUpdates();

        let r = await AppFetch(await Endpoints('filter'), { 
            method: 'POST',
            headers: {
                'Accept-Type': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query, not: notEqual })
        });

        this.serverSideFilterQuery = query;

        restart && await this.startUpdates();

        

    }

    setAutoSimilars = async (state) => {
        this.autoSimilars = state;
    }

    updateStack = async () => {

        this.onSetSecondsRemaining(this.updateIntervalTime / 1000);
        await this.getChartUpdate();
        this.autoSimilars && await this.getAutoSimilars();
        //this.setServerSideFilter(this.serverSideFilterQuery, false);
    }

    startUpdates = async () => {

        this.updateIntervalTime = Number(((await SecureStore.getItemAsync(this.updateIntervalTimeKey) || this.updateIntervalTime)));

        clearInterval(this.updateInterval);
        this.updateInterval = setInterval(() => {
            this.updateStack();
        }, this.updateIntervalTime);

        this.updateStack();

        this.updatesStarted = true;
        
    }

    stopUpdates = () => {
        this.onSetSecondsRemaining(0);
        clearInterval(this.updateInterval);
        this.updatesStarted = false;
    }

    getSavedMetricTypes = async () => {

        return JSON.parse(await SecureStore.getItemAsync(this.metricConfigKey) || "{}");

    }

    setMetricType = async (type, limit) => {
        this.stopUpdates();

        await SecureStore.setItemAsync(this.metricConfigKey, JSON.stringify({ type, limit }));

        let r = await AppFetch(await Endpoints('dashUpdate'), { 
            method: 'POST',
            headers: {
                'Accept-Type': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.chartPollData(type, limit))
        });
        await this.startUpdates();
        return r.status;
    }

    getChartFigure = async id => {

        let r = await AppFetch(await Endpoints('chartFigure') + id, { 
            method: 'GET',
        });

        return await r.json();

    }

    getAutoSimilars = async () => {
        if (this.alternateSimilarFetchLock) {
            return;
        }
        this.alternateSimilarFetchLock = true;
        let r = await AppFetch(await Endpoints('similarAll'), { 
            method: 'GET',
        });

        this.onAutoSimilarCharts(await r.json());
        this.alternateSimilarFetchLock = false;
    }
    
    getChartUpdate = async () => {

        if (this.chartUpdateLock) return;

        this.chartUpdateLock = true;

        let start = Date.now();

        let metricsResponse = await AppFetch(await Endpoints('serverMetrics'), { 
            method: 'GET',
        });

        if (metricsResponse.ok) {
            let data = await metricsResponse.json();
            this.onServerMetrics(data);
        }

        let r = await AppFetch(await Endpoints('images'), { 
            method: 'GET',
        });

        let end = Date.now();

        let diff = end - start;

        this.onUpdateDuration(diff / 1000);

        if (!this.updatesStarted) return;

        if (r.status === 200) {
            let data = await r.json();

            this.onChartUpdate(data);

            this.chartUpdateLock = false;

            return;

        } else {

            this.onChartUpdate({});

            this.chartUpdateLock = false;

            return null;
        }


    }

}

class SimilarChart extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            similarCharts: [],
            pinned: {},
            tag: ''
        }
    }

    deriveCharts = correlate => {

        let charts = [];

        for (let chartArray of correlate.metrics) {
            if (!chartArray) continue;
            charts.push({ id: chartArray[0].id, img: chartArray[2], fit: chartArray[1], tag: chartArray[0].tag });
        }
        //charts.push({ separator: true, key: String(Date.now()) });

        return charts.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });

    }

    get = async () => {
        if (!this.mounted) return;
        let r = await AppFetch(await Endpoints('similar') + this.props.chartId, {
            method: 'GET'
        })

        if (r.ok) {
            let data = await r.json();
            if (data.status !== 'success') return null;

            let correlate = data.correlates[0];

            if (data.correlates.length > 1) {
                for (let i=1; i<data.correlates.length; i++) {
                    let correlate = data.correlates[i];
                    if (!correlate?.metrics?.length) continue;
                    let head = correlate.metrics[0][0];
                    this.props.onSpawnChild(head.id + '.' + head.tag, correlate);
                }
            }

            let charts = this.deriveCharts(correlate);

            this.setState(update(this.state, { similarCharts: {$set: charts}, loading: {$set: false} }));
        }
    }

    componentDidMount = async () => {
        this.mounted = true;
        if (this.props.correlate) {
            this.setState(update(this.state, { similarCharts: {$set: this.deriveCharts(this.props.correlate)}, loading: {$set: false} }));
        } else {
            this.interval = setInterval(async () => {
                executionQueue.push(async () => {
                    await this.get();
                })
            }, 30000);
            executionQueue.push(async () => {
                await this.get();
            })
        }
    }

    componentWillUnmount = () => {
        this.mounted = false;
        clearInterval(this.interval);
    }

    render = () => {

        let rowTag = this.state.similarCharts[0]?.tag;

        return <ScrollView style={{ width: "100%" }} horizontal={true} contentContainerStyle={{ paddingLeft: 20 }} >
                {!this.props.auto && <View style={{ alignItems: 'center', justifyContent: 'center' }} >
                    <TouchableOpacity onPress={this.props.onRemove} >
                        <Ionicons name="close-circle" color="red" size={24} />
                    </TouchableOpacity>
                </View>}
                {!this.props.auto && <Chart tag={rowTag} altImg={this.state.similarCharts[0]?.img} key={this.props.chartId} chart={this.props.chartData} onShowInfo={() => {
                    this.props.onShowInfo({...this.props.chartData, id: this.props.chartId, tag: rowTag, altImg: this.state.similarCharts[0]?.img});
                }} />}
                <MaterialCommunityIcons style={{ alignSelf: 'center' }} name="chevron-double-right" size={38} color={Theme.colors.palette.primary} />
                {this.state.loading && <View style={{ flexDirection: 'row' }} >
                    <Animatable.View
                            animation={{0: {opacity: 0.2}, 0.2: {opacity: 1}, 1: {opacity: 0.2}}} 
                            iterationCount="infinite" 
                            duration={1000}
                            style={{width: 150, height: 150, backgroundColor: "#d7d7d7", margin: 5, borderRadius: 10, borderWidth: 4, borderColor: "#d7d7d7"}} 
                    />
                    <Animatable.View
                        animation={{0: {opacity: 0.2}, 0.4: {opacity: 1}, 1: {opacity: 0.2}}} 
                        iterationCount="infinite" 
                        duration={1000}
                        style={{width: 150, height: 150, backgroundColor: "#d7d7d7", margin: 5, borderRadius: 10, borderWidth: 4, borderColor: "#d7d7d7"}} 
                    />
                    <Animatable.View
                        animation={{0: {opacity: 0.2}, 0.6: {opacity: 1}, 1: {opacity: 0.2}}} 
                        iterationCount="infinite" 
                        duration={1000}
                        style={{width: 150, height: 150, backgroundColor: "#d7d7d7", margin: 5, borderRadius: 10, borderWidth: 4, borderColor: "#d7d7d7"}} 
                    />
                </View>}

                {!this.props.loading && Object.keys(this.state.pinned).length > 0 && Object.keys(this.state.pinned).map(chartId => {
                    let chart = this.state.pinned[chartId];
                    if (chart.id === this.props.chartId) return null;
                    return <Chart altImg={chart.img} tag={chart.tag} key={chart.id} fit={Math.abs(chart.fit)} chart={{id: chart.id, ...this.props.charts[chart.id]}} pinned={true} onPinPress={() => {
                        this.setState(update(this.state, { pinned: {$unset: [chart.id]} }));
                    }} onShowInfo={() => {
                        this.props.onShowInfo({...this.props.charts[chart.id], id: chart.id, tag: chart.tag, altImg: chart.img});
                    }} onGenerateScatter={() => {
                        this.props.onGenerateScatter({ chartA: { ...this.props.chartData, tag: rowTag }, chartB: chart });
                    }} />
                })}

                {!this.props.loading && this.state.similarCharts.length > 0 && this.state.similarCharts.map((chart, index) => {
                    //if (chart.separator && this.state.similarCharts[index + 1]) return <MaterialCommunityIcons key={chart.key} style={{ alignSelf: 'center' }} name="chevron-double-right" size={38} color={Theme.colors.palette.primary} />

                    if (chart.id === this.props.chartId || this.state.pinned[chart.id]) return null;
                    return <Chart altImg={chart.img} tag={chart.tag} key={chart.id + '-' + chart.tag} fit={chart.fit} chart={{id: chart.id, ...this.props.charts[chart.id]}} pinned={false} onPinPress={() => {
                        this.setState(update(this.state, { pinned: {[chart.id]: {$set: chart}} }));
                    }} onShowInfo={() => {
                        this.props.onShowInfo({...this.props.charts[chart.id], id: chart.id, tag: chart.tag, altImg: chart.img});
                    }} onGenerateScatter={() => {
                        this.props.onGenerateScatter({ chartA: { ...this.props.chartData, tag: rowTag }, chartB: chart });
                    }} />
                })}


            </ScrollView>

    }

}

const trending = (direction, style, size=11, hockeystick=false) => {
    return <View style={{ backgroundColor: direction === 'up' ? Theme.colors.palette.secondary : Theme.colors.palette.primary, zIndex: 9, padding: 5, paddingLeft: 6, paddingRight: 6, borderRadius: 9999, ...style }} >
        {!hockeystick && <Ionicons name={direction === 'up' ? "trending-up" : 'trending-down'} size={size} color={direction === 'up' ? "black" : "white"} />}
        {hockeystick && <MaterialCommunityIcons name="hockey-sticks" size={size} color={direction === 'up' ? "black" : "white"} style={{ transform: [{rotate: direction === 'up' ? '0deg' : "180deg"}] }} />}
    </View>
}

class Chart extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            showInfo: false,
            opacity: new Animated.Value(0),
            img: ''
        }
    }

    componentDidMount = () => {

        this.setState(update(this.state, { img: {$set: this.props.altImg || this.props.chart.img}}), () => {
            if (this.props.disableAnimation) {
                this.setState(update(this.state, { opacity: {$set: 1} }));
            } else {
                Animated.timing(this.state.opacity, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.exp),
        
                }).start()
            }
        })

    }

    render = () => {

        if (!this.props.chart) return null;

        return <Animated.View key={this.props.chart.id} style={{ opacity: this.state.opacity }}  >
            
            <TouchableOpacity style={{ margin: 5, borderWidth: this.props.chart.status === 'critical' ? 6 : this.props.chart.status === 'warning' ? 4 : 4, borderColor: this.props.chart.status === 'critical' ? 'red' : this.props.chart.status === 'warning' ? '#ff8f17' : 'transparent', borderRadius: 10 }} onPress={() => {
                this.props.onShowInfo();
            }} >
                {!!this.props.chart.features?.decreasing && this.props.chart.plot !== 'scatter' && trending('down', {position: 'absolute', bottom: 5, left: 5, }, this.props.tag ? 9 : 14)}

                {!!this.props.chart.features?.increasing && this.props.chart.plot !== 'scatter' && trending('up', {position: 'absolute', bottom: 5, left: 5, }, this.props.tag ? 9 : 14)}

                {!!this.props.chart.features?.hockeystick?.increasing && trending('up', {position: 'absolute', bottom: 5, left: 5, }, this.props.tag ? 9 : 14, true)}

                {!!this.props.chart.features?.hockeystick?.decreasing && trending('down', {position: 'absolute', bottom: 5, left: 5, }, this.props.tag ? 9 : 14, true)}

                {this.props.tag !== undefined && <View style={{ backgroundColor: "#e7e7e7", borderRadius: 9999, padding: 5, position: 'absolute', bottom: 5, left: (this.props.chart.features?.increasing || this.props.chart.features?.decreasing) ? 30 : 5, zIndex: 9 }} >
                    <AppText style={{ color: 'black', fontSize: 9 }} >Tag {this.props.tag}</AppText>
                </View>}

                <Image source={{ uri: this.state.img }} style={{ width: 150, height: 150, borderRadius: 10 }} />
                {this.props.similarActive && this.props.chart.plot !== 'scatter' && <TouchableOpacity onPress={this.props.onSimilarSelect} style={{ backgroundColor: Theme.colors.palette.primary, borderRadius: 9999, padding: 5, position: 'absolute', bottom: 5, right: 5 }} >
                    <MaterialCommunityIcons name="chevron-double-right" size={14} color={'white'} /> 
                </TouchableOpacity>}
                {this.props.fit && <View style={{ backgroundColor: this.props.fit < .8 ? '#e7e7e7' : this.props.fit > .9 ? 'red' : '#ff8f17', borderRadius: 9999, padding: 5, position: 'absolute', top: 5, right: 5 }} >
                    <AppText style={{ color: this.props.fit < .8 ? 'black' : 'white', fontSize: 9 }} >{(Math.round(this.props.fit * 100)) + "%"}</AppText>
                </View>}
                {this.props.pinned !== undefined && <TouchableOpacity onPress={this.props.onPinPress} style={{ backgroundColor: this.props.pinned ? Theme.colors.palette.primary : 'transparent', borderRadius: 9999, padding: 5, position: 'absolute', bottom: 5, right: 5 }} >
                    <MaterialCommunityIcons name={this.props.pinned ? "pin" : "pin-outline"} size={14} color={this.props.pinned ? 'white' : Theme.colors.palette.primary} /> 
                </TouchableOpacity>}

                {this.props.pinned !== undefined && <TouchableOpacity onPress={this.props.onGenerateScatter} style={{ borderRadius: 9999, padding: 5, position: 'absolute', bottom: 5, right: 25 }} >
                    <MaterialCommunityIcons name={"scatter-plot"} size={14} /> 
                </TouchableOpacity>}
               
            </TouchableOpacity>

        </Animated.View>;

    }

}


class Home extends Component {

    constructor(props) {
        super(props);

        this.setLoadingSentinelValues = () => {

            let numberToCreate = RandomNumber(15, 30);

            let a = [];
            for (let i=0; i<numberToCreate; i++) {
                a.push({ peak: RandomNumber(0, 1), duration: RandomNumber(2000, 7000), borderWidth: RandomNumber(4, 7) })
            }

            return a;
        }

        this.state = {
            charts: {},
            chartStatuses: {},
            chartSortOption: 'critical_first',
            metricType: '',
            metricWeightPreference: 'rstd',
            chartLimit: 0,
            chartLoading: false,
            chartUpdateKey: String(Date.now()),
            chartUpdateSeconds: 0,
            showInfo: false,
            showInfoData: null,
            showInfoRefresh: String(Date.now()),
            returnToScatter: null,
            metricFilter: '',
            metricServerFilter: '',
            metricFilters: [],
            metricServerFilterComplete: false,
            metricServerFilterCompleteText: '',
            metricServerFilterLoading: false,
            notEqualFilter: false,
            serverNotEqualFilter: false,
            forceLoading: true,
            updateDurations: [],
            totalServerMetrics: 0,
            serverMetricsDropped: 0,
            serverMetricsProcessed: 0,
            serverMetricsAvailable: 0,
            updateDuration: 0,
            showInfoDataRefresh: 0,
            numberOfSentinels: this.setLoadingSentinelValues(),
            filterPresets: {},
            renderCharts: {
                charts: [],
                someAbnormal: false
            },

            showSimilarPanel: false,
            autoSimilar: false,
            autoSimilarCharts: [],
            similarMetrics: {},
            hiddenSimilarCharts: {},
            mainSplit: 150 * 6,
            showHudInfo: false,
            tagDerivedFromId: false

        }

        this.metricFilterSearchBarRef = React.createRef();
        this.metricServerFilterSearchBarRef = React.createRef();

        this.metricTypeDropdownRef = React.createRef();
        this.metricNumberDropdownRef = React.createRef();

        this.chartData = new ChartData();

        this.metricFilters = new MetricFilters();
        
    }

    sendServerFilter = () => {
        setTimeout(() => {
            this.setState(update(this.state, { metricServerFilterLoading: {$set: true} }), async () => {
                await this.chartData.setServerSideFilter(this.state.metricServerFilter, this.state.serverNotEqualFilter);
                this.setState(update(this.state, { metricServerFilterLoading: {$set: false}, metricServerFilterComplete: {$set: true}, metricServerFilterCompleteText: {$set: this.state.metricServerFilter }}));
            });
        }, 0);
        
    }

    renderCharts = (timeout=0) => {
        setTimeout(() => {
            let someAbnormal = false;

            let chartStates = {

                critical: [],
                warning: [],
                normal: []

            }

            for (let chartId in this.state.charts) {

                let chart = {...this.state.charts[chartId]};

                if (chart.status !== 'normal') someAbnormal = true;

                let searchString = chart.metric + ',' + JSON.stringify(chart.tags) + ',' + JSON.stringify({status: chart.status}) + ',' + chart.type + ',' + JSON.stringify({ features: chart.features }) + ',' + JSON.stringify({ cardinality: chart.cardinality }) + ',' + JSON.stringify({ plot: chart.plot });

                if (chart.plot === 'scatter') {
                    delete chart.features.increasing;
                    delete chart.features.decreasing;
                }

                if (this.state.metricFilter.length) {
                    try {
                        if (this.state.notEqualFilter) {
                            if (searchString.match(`${this.state.metricFilter}`)) {
                                continue;
                            }
                        } else {
                            if (!searchString.match(`${this.state.metricFilter}`)) {
                                continue;
                            }
                        }
                        
                    } catch (e) {
                        console.error('e', e);
                        continue;
                    }
                    
                }

                let priorityFilters = Object.keys(this.state.filterPresets).map(f => {
                    if (this.state.filterPresets[f].priority) {
                        return f;
                    }
                });

                let normalFilters = Object.keys(this.state.filterPresets).map(f => {
                    if (!this.state.filterPresets[f].priority) {
                        return f;
                    }
                });

                priorityFilters = priorityFilters.filter(i => i);
                normalFilters = normalFilters.filter(i => i);

                
                if (priorityFilters.length) {
                    let presetMatch = false;

                    for (let preset of priorityFilters) {
                        if (!preset) continue;
                        if (searchString.match(`${preset}`)) {
                            presetMatch = true;
                        }
                    }

                    if (!presetMatch) continue;
                }

                if (normalFilters.length) {
                    let presetMatch = false;

                    for (let preset of normalFilters) {
                        if (searchString.match(`${preset}`)) {
                            presetMatch = true;
                        }
                    }

                    if (!presetMatch) continue;
                }

                let weight = (this.state.metricWeightPreference === 'alpha' ? -chart.metric.charCodeAt(0) : this.state.metricWeightPreference === 'rstd' ? chart.stats.rstd : this.state.metricWeightPreference === 'mean' ? chart.stats.mean : chart.stats.std) + Math.abs((chart.features.increasing?.increase ?? 0) + (chart.features.decreasing?.decrease ?? 0)) + (Math.abs(chart.features.hockeystick?.increasing || chart.features.hockeystick?.increasing || 0));  

                chartStates[chart.status].push({...chart, id: chartId, weight});

            }


            let weightSort = ( a, b ) => {
                if ( a.weight < b.weight ){
                    return 1;
                }
                if ( a.weight > b.weight ){
                    return -1;
                }

                return 0;
            }

            chartStates.critical.sort(weightSort);
            chartStates.warning.sort(weightSort);
            chartStates.normal.sort(weightSort);

            let charts; 

            if (this.state.chartSortOption === 'critical_first') {
                charts = [...chartStates.critical, ...chartStates.warning, ...chartStates.normal];
            } else if (this.state.chartSortOption === 'warning_first') {
                charts = [...chartStates.warning, ...chartStates.critical, ...chartStates.normal];
            } else if (this.state.chartSortOption === 'normal_first') {
                charts = [...chartStates.normal, ...chartStates.critical, ...chartStates.warning];
            }

            this.setState(update(this.state, { renderCharts: {$set: { charts, someAbnormal } }, forceLoading: {$set: false} }));
        }, timeout);

    }

    componentDidUpdate = (prevProps, prevState) => {
        if (this.state.forceLoading !== prevState.forceLoading && !this.state.forceLoading) {
            this.setState(update(this.state, { numberOfSentinels: {$set: this.setLoadingSentinelValues()} }));
        }
    }

    componentDidMount = async () => {

        await fetch('/config.json', { cache: 'reload' })

        this.metricFilters.onFilters = filters => {
            this.setState(update(this.state, {metricFilters: {$set: filters}}));
        }

        await this.metricFilters.get();

        this.chartData.onChartUpdate = (charts) => {
            this.setState(update(this.state, { charts: {$set: charts} }), () => {
                this.renderCharts();
            });
        }

        this.chartData.onSetSecondsRemaining = (seconds) => {
            this.setState(update(this.state, { chartUpdateSeconds: {$set: seconds}, chartUpdateKey: {$set: String(Date.now())} }));
        }

        this.chartData.onAutoSimilarCharts = correlates => {
            this.setState(update(this.state, { autoSimilarCharts: {$set: correlates.correlates} }));
        }

        this.chartData.onServerMetrics = metrics => {
            let seconds = metrics["poll-time"] ?? 0;
            let count = metrics["metric-count"] ?? 0;

            this.setState(update(this.state, { updateDurations: {$push: [Number(seconds)]}, totalServerMetrics: {$set: count}, serverMetricsProcessed: {$set: metrics["metrics-processed"] ?? 0}, serverMetricsAvailable: {$set: metrics["metrics-available"] ?? 0} }), () => {
                let total = 0;
                for(let i = 0; i < this.state.updateDurations.length; i++) {
                    total += this.state.updateDurations[i];
                }
                let avg = Math.round((total / this.state.updateDurations.length) * 10) / 10;
                this.setState(update(this.state, { updateDuration: {$set: avg} }), () => {
                    if (this.state.updateDurations.length > 10) {
                        let a = [...this.state.updateDurations];
                        a.shift();
                        this.setState(update(this.state, { updateDurations: {$set: a} }));
                    }
                });
            })
        }

        let metricTypes = await this.chartData.getSavedMetricTypes();

        if (Object.keys(metricTypes).length) {

            await new Promise((res) => {
                this.setState(update(this.state, { metricType: {$set: metricTypes.type }, chartLimit: {$set: metricTypes.limit } }), res)
            })
        }

        await this.chartData.setMetricType(this.state.metricType, this.state.chartLimit);

        this.sendServerFilter();

        

    }

    componentWillUnmount = () => {
        this.chartData.stopUpdates();
    }

    renderSimilarItem = ({ item: chart }) => {

        let properChartId = this.state.autoSimilar ? '' : chart.id.includes('.') ? chart.id.split('.')[0] : chart.id;

        return <SimilarChart auto={this.state.autoSimilar} chartId={properChartId} correlate={this.state.autoSimilar ? chart : chart.correlate} chartData={this.state.charts[properChartId]} charts={this.state.charts} onShowInfo={chart => {
            this.setState(update(this.state, { showInfo: {$set: true}, showInfoData: {$set: chart} }));
        }} onRemove={() => {
            this.setState(update(this.state, { similarMetrics: {$unset: [chart.id]} }));
        }} onSpawnChild={(headId, correlate) => {
            this.setState(update(this.state, { similarMetrics: {[headId]: {$set: {ts: Date.now(), correlate}}} }));
        }} onGenerateScatter={({ chartA, chartB }) => {
            this.setState(update(this.state, { showInfo: {$set: true}, showInfoData: {$set: {...chartA, chartB }} }));
        }} />
    }

    renderChartItem = ({ item: chart }) => {
        return <Chart key={chart.id} chart={chart} similarActive={this.state.showSimilarPanel && !this.state.autoSimilar} onSimilarSelect={() => {
            this.setState(update(this.state, { similarMetrics: { [chart.id]: {$set: { ts: Date.now() }} }, autoSimilar: {$set: false} }));
        }} disableAnimation={true} onShowInfo={() => {
            this.setState(update(this.state, { showInfo: {$set: true}, showInfoData: {$set: chart} }));
        }} />
    }

    headerComponent = () => {
        let charts = this.state.renderCharts.charts;
        let someAbnormal = this.state.renderCharts.someAbnormal;

        return <View style={{ padding: 10 }} >
            <View style={{ height: Dimensions.get('window').height * 0.1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }} >
                <AppText tag="h1" style={{ alignSelf: 'center' }} >Metrics</AppText>

                <TouchableOpacity disabled={this.state.forceLoading} onPress={async () => {
                    this.chartData.stopUpdates();

                    let t = 0;

                    if (this.chartData.updateIntervalTime === 30000) {
                        t = 60000;
                    } else if (this.chartData.updateIntervalTime === 60000) {
                        t = 16000;
                    } else if (this.chartData.updateIntervalTime === 16000) {
                        t = 8000;
                    } else {
                        t = 30000;
                    }

                    await this.chartData.setUpdateIntervalTime(t);


                    await this.chartData.startUpdates();
                }} style={{ alignSelf: 'center' }} >
                    <View style={{flexDirection: 'row', alignSelf: 'center', alignItems: 'center', minWidth: 200, justifyContent: 'center'}} >
                        <AppText style={{ color: 'gray' }} >{charts.length + '/' + this.state.serverMetricsAvailable + ' : ' + this.state.serverMetricsProcessed + '/' + this.state.totalServerMetrics} &middot;</AppText>
                        <View style={{ width: 5 }} />
                        {!this.state.chartLoading && <CountdownCircleTimer
                            isPlaying
                            duration={this.state.chartUpdateSeconds}
                            colors={['purple']}
                            size={24}
                            strokeWidth={2}
                            key={this.state.chartUpdateKey}
                            //updateInterval={1}

                        >{({ remainingTime }) => <AppText style={{ color: Theme.colors.palette.primary, fontFamily: 'Mono' }} >{remainingTime}</AppText>}</CountdownCircleTimer>}
                        <View style={{ width: 5 }} />
                        <AppText style={{ color: 'gray' }} >&middot; {this.state.updateDuration || '0.0'}s</AppText>
                        <TouchableOpacity onPress={() => {
                            this.setState(update(this.state, { showHudInfo: {$set: true} }));
                        }} style={{ alignItems: 'center', marginLeft: 5 }} >
                            <Ionicons name="information-circle" color="gray" size={16} />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
                

                <View style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center' }} >
                    <View style={{ justifyContent: 'space-evenly' }} >
                        <TouchableOpacity style={{ backgroundColor: !this.state.notEqualFilter ? 'transparent' : Theme.colors.palette.primary, padding: 5, borderRadius: 5 }} onPress={() => {
                            clearTimeout(this.clientMetricNotEqualTimeout);
                            this.setState(update(this.state, { notEqualFilter: {$set: !this.state.notEqualFilter} }), () => {
                                this.clientMetricNotEqualTimeout = setTimeout(() => {
                                    this.renderCharts();
                                }, 500);
                            });

                            

                        }} >
                            <FontAwesome5 name="not-equal" size={16} color={this.state.notEqualFilter ? 'white' : Theme.colors.palette.primary} />
                        </TouchableOpacity>
                        <View style={{ height: 13 }} />
                        <TouchableOpacity style={{ backgroundColor: !this.state.serverNotEqualFilter ? 'transparent' : Theme.colors.palette.primary, padding: 5, borderRadius: 5 }} onPress={() => {
                            this.setState(update(this.state, { serverNotEqualFilter: {$set: !this.state.serverNotEqualFilter} }), () => {
                                this.sendServerFilter();
                            });
                        }} >
                            <FontAwesome5 name="not-equal" size={16} color={this.state.serverNotEqualFilter ? 'white' : Theme.colors.palette.primary} />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={{ width: 5 }} />
                    <View >
                        <AppTextInput action="arrow-down-circle" actionDisabled={this.state.metricFilter.length < 1} onAction={() => {
                            this.metricServerFilterSearchBarRef.current?.setValue(this.state.metricFilter);
                            this.metricFilterSearchBarRef.current?.setValue('');
                            
                        }} ref={this.metricFilterSearchBarRef} placeholder="Local metric filter (regex)" style={{ width: 400, alignSelf: 'center', borderBottomRightRadius: 0, borderBottomLeftRadius: 0, fontFamily: 'Mono', fontWeight: 'bold' }} onChangeText={text => {
                            clearTimeout(this.clientMetricFilterTimeout);
                            
                            this.clientMetricFilterTimeout = setTimeout(() => {
                                this.setState(update(this.state, { metricFilter: {$set: text } }));
                                this.renderCharts();
                            }, 500);
                            return text;
                        }} />

                        <AppTextInput noClickAction={true} action="cloud-upload" actionDoneIcon="cloud-done-outline" actionLoading={this.state.metricServerFilterLoading} actionComplete={this.state.metricServerFilterComplete} onAction={async () => {
                            this.sendServerFilter();
                        }} ref={this.metricServerFilterSearchBarRef} placeholder="Cloud metric filter (regex)" style={{ width: 400, alignSelf: 'center', borderTop: 0, borderTopRightRadius: 0, borderTopLeftRadius: 0, fontFamily: 'Mono', fontWeight: 'bold'}} onChangeText={text => {

                            clearTimeout(this.serverMetricFilterTimeout);

                            //this.setState(update(this.state, { metricServerFilterTyping: {$set: true } }));

                            this.serverMetricFilterTimeout = setTimeout(() => {
                                this.setState(update(this.state, { metricServerFilter: {$set: text }, metricServerFilterTyping: {$set: false } }), () => {

                                    this.setState(update(this.state, { metricServerFilterComplete: {$set: text === this.state.metricServerFilterCompleteText } }));
                                    this.sendServerFilter();
                                });
                            }, 1000);

                            
                            return text;
                        }} />
                    </View>
                    
                    <TouchableOpacity disabled={this.state.metricFilter.length < 1 && this.state.metricServerFilter.length < 1} style={{ padding: 5, borderRadius: 5 }} onPress={async () => {
                        await this.metricFilters.add(this.state.metricFilter, this.state.metricServerFilter, { notEqual: this.state.notEqualFilter, serverNotEqual: this.state.serverNotEqualFilter });
                    }} >
                        <Ionicons name="save" size={24} color={(this.state.metricFilter.length < 1 && this.state.metricServerFilter.length < 1) ? 'gray' : Theme.colors.palette.primary} />
                    </TouchableOpacity>
                </View>

                <AppPicker ref={this.metricTypeDropdownRef} disabled={this.state.forceLoading} options={[
                    
                    {
                        id: 'rstd',
                        name: 'By RSTD'
                    },
                    {
                        id: 'mean',
                        name: 'By Mean'
                    },
                    {
                        id: 'std',
                        name: 'By STD'
                    },
                    {
                        id: 'alpha',
                        name: 'By A-Z'
                    }

                ]} currentOption={this.state.metricWeightPreference} onOptionChange={option => {
                    this.setState(update(this.state, { metricWeightPreference: {$set: option}}), async () => {
                        this.renderCharts(500);
                    });

                }} pickerName="Sorting Weight Preference" />
                

                <AppPicker ref={this.metricTypeDropdownRef} disabled={this.state.forceLoading} options={[
                    
                    {
                        id: '',
                        name: 'All Types'
                    },
                    {
                        id: 'counter',
                        name: 'Counter'
                    },
                    {
                        id: 'gauge',
                        name: 'Gauge'
                    }
                ]} currentOption={this.state.metricType} onOptionChange={option => {
                    this.setState(update(this.state, { metricType: {$set: option}, charts: {$set: []}, forceLoading: {$set: true} }), async () => {
                        await this.chartData.setMetricType(option, this.state.chartLimit);
                        await this.chartData.updateStack();
                    });

                }} pickerName="Metric Type" />

                <AppPicker disabled={this.state.forceLoading} options={[
                    {
                        id: 0.1,
                        name: 'Less'
                    },
                    {
                        id: 0.0001,
                        name: 'More'
                    },
                    {
                        id: 0.0000001,
                        name: 'Many'
                    },
                    {
                        id: 0,
                        name: 'All'
                    },

                ]} ref={this.metricNumberDropdownRef} currentOption={this.state.chartLimit} onOptionChange={option => {
                    this.setState(update(this.state, { chartLimit: {$set: option}, charts: {$set: []}, renderCharts: {charts: {$set: []}}, forceLoading: {$set: true} }), async () => {
                        await this.chartData.setMetricType(this.state.metricType, option);
                    });
                    
                }} pickerName="Number of metrics" />

                {false && <AppPicker disabled={this.state.forceLoading} options={[
                    {
                        id: 'critical_first',
                        name: 'Hot First'
                    },
                    {
                        id: 'warning_first',
                        name: 'Warm First'
                    },
                    {
                        id: 'normal_first',
                        name: 'Cool First'
                    }
                ]} currentOption={this.state.chartSortOption} onOptionChange={option => {
                    this.setState(update(this.state, { chartSortOption: {$set: option} }));
                }} pickerName="Sort metrics by" />}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} style={{ height: Dimensions.get('window').height * 0.05, width: "100%" }}  >
                    <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }} >
                        {this.state.metricFilters.map((filter, index) => {
                            let selected = filter.preset ? filter.filter in this.state.filterPresets : this.state.metricFilter === filter.filter && this.state.metricServerFilter === filter.serverFilter && this.state.notEqualFilter === filter.notEqual && this.state.serverNotEqualFilter === filter.serverNotEqual;

                            let shouldDisplaySeparator = (this.state.metricFilters[index - 1]?.preset === true && !filter.preset) || filter.displaySeparator;

                            return <View key={filter.filter} style={{ flexDirection: 'row', alignItems: 'center' }} >
                                {shouldDisplaySeparator && <AppText style={{ paddingRight: 5 }} >&middot;</AppText>}

                                <TouchableOpacity style={{ borderStyle: filter.priority ? 'dotted' : 'solid', borderWidth: 1, borderColor: filter.preset ? Theme.colors.palette.primary : 'transparent', padding: 5, backgroundColor: selected ? Theme.colors.palette.primary : filter.preset ? 'transparent' : '#e7e7e7', borderRadius: 99999, alignSelf: 'flex-start', flexDirection: 'row', marginRight: 5 }} onPress={() => {

                                    //this.setState(update(this.state, { metricFilter: {$set: filter.filter} }));

                                    if (filter.preset) {
                                        if (this.state.filterPresets[filter.filter]) {
                                            this.setState(update(this.state, { filterPresets: {$unset: [filter.filter]} }), () => {
                                                this.renderCharts();
                                            });
                                        } else {
                                            /*
                                            this.setState(update(this.state, { filterPresets: {[filter.filter]: {$set: { priority: filter.priority }}} }), () => {
                                                this.renderCharts();
                                            });
                                            */

                                            this.setState(update(this.state, { filterPresets: {[filter.filter]: {$set: { priority: filter.priority }}} }), () => {
                                                let unset = [];
                                                for (let f in this.state.filterPresets) {
                                                    if (this.state.filterPresets[f]?.priority === filter.priority && f !== filter.filter && typeof(filter.priority) !== "undefined") {
                                                        unset.push(f);
                                                    }
                                                }
                                                this.setState(update(this.state, { filterPresets: {$unset: unset} }), () => {
                                                    this.renderCharts();
                                                });
                                            });
                                        }
                                    } else {
                                        if ((this.state.metricFilter === filter.filter && this.state.metricServerFilter === filter.serverFilter) && this.state.notEqualFilter === filter.notEqual && this.state.serverNotEqualFilter === filter.serverNotEqual) {
                                            this.setState(update(this.state, { metricFilter: {$set: ''}, metricServerFilter: {$set: ''}, notEqualFilter: {$set: false}, serverNotEqualFilter: {$set: false} }), () => {
                                                //this.sendServerFilter();
                                                this.metricFilterSearchBarRef.current?.setValue('');
                                                this.metricServerFilterSearchBarRef.current?.setValue('');
                                                this.renderCharts();
                                            })
                                            
                                        } else {
                                            this.setState(update(this.state, { notEqualFilter: {$set: filter.notEqual}, serverNotEqualFilter: {$set: filter.serverNotEqual} }), () => {
                                                this.metricFilterSearchBarRef.current?.setValue(filter.filter);
                                                setTimeout(() => {
                                                    this.metricServerFilterSearchBarRef.current?.setValue(filter.serverFilter);
                                                    setTimeout(() => {
                                                        //this.sendServerFilter();
                                                        this.renderCharts();
                                                    }, 0);
                                                }, 0);
                                            })
                                        }
                                    }
                                    
                                }} >

                                    {!!filter.filter && <AppText style={{ color: selected ? 'white' : filter.preset ? Theme.colors.palette.primary : 'black'}} >{!filter.preset && <Ionicons name="laptop-outline" style={{marginRight: 5}} />}{!!filter.notEqual && <FontAwesome5 name="not-equal" size={11} color={selected ? 'white' : "gray"} style={{ alignSelf: 'center', marginRight: 5 }} />}{filter.name ?? filter.filter}</AppText>}

                                    {!!filter.serverFilter && <AppText style={{ color: selected ? 'white' : 'black'}} >{!!filter.filter && <AppText> &middot; </AppText>}<Ionicons name="cloud-outline" style={{ marginRight: 3 }} /> {!!filter.serverNotEqual && <FontAwesome5 name="not-equal" size={11} color={selected ? 'white' : "gray"} style={{ alignSelf: 'center', marginRight: 5 }} />}{filter.serverFilter}</AppText>}

                                    {filter.preset !== true && <TouchableOpacity style={{ marginLeft: 5, marginBottom: -5 }} onPress={async () => {
                                        await this.metricFilters.remove(filter.filterCanonical);
                                        if (selected) {
                                            this.setState(update(this.state, { metricFilter: {$set: ''}, metricServerFilter: {$set: ''} }), () => {
                                                this.sendServerFilter();
                                                this.metricFilterSearchBarRef.current?.setValue('');
                                                this.metricServerFilterSearchBarRef.current?.setValue('');
                                                this.renderCharts();
                                            })
                                        }
                                    }} >
                                        <Ionicons name="trash" size={16} color={selected ? Theme.colors.palette.secondary : "red"} />
                                    </TouchableOpacity>}

                                </TouchableOpacity>
                            </View>
                        })}
                    </View>
                    
                </ScrollView>

                <TouchableOpacity style={{ borderColor: Theme.colors.palette.primary, borderWidth: 1, padding: 5, borderRadius: 10, backgroundColor: this.state.showSimilarPanel ? Theme.colors.palette.primary : 'transparent', borderTopRightRadius: this.state.showSimilarPanel ? 0 : 10, borderBottomRightRadius: this.state.showSimilarPanel ? 0 : 10, marginLeft: 5 }} onPress={() => {
                    this.setState(update(this.state, { showSimilarPanel: {$set: !this.state.showSimilarPanel} }))
                }} >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 18 }} >
                        <MaterialCommunityIcons name="chevron-double-right" size={18} color={this.state.showSimilarPanel ? 'white' : Theme.colors.palette.primary} /> 
                        <AppText style={{ color: this.state.showSimilarPanel ? 'white' : Theme.colors.palette.primary }} >Similar metrics</AppText>
                    </View>
                    
                </TouchableOpacity>

                {this.state.showSimilarPanel && <TouchableOpacity style={{ borderColor: Theme.colors.palette.primary, borderWidth: 1, padding: 5, borderRadius: 10, backgroundColor: this.state.autoSimilar ? Theme.colors.palette.primary : 'transparent', borderTopLeftRadius: this.state.showSimilarPanel ? 0 : 10, borderBottomLeftRadius: this.state.showSimilarPanel ? 0 : 10, borderLeftColor: this.state.autoSimilar ? 'white' : Theme.colors.palette.primary }} onPress={() => {
                    this.setState(update(this.state, { autoSimilar: {$set: !this.state.autoSimilar} }), () => {
                        this.chartData.setAutoSimilars(this.state.autoSimilar);
                    })
                }} >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 18 }} >
                        <Ionicons name="search" size={12} color={this.state.autoSimilar ? 'white' : Theme.colors.palette.primary} /> 
                        <View style={{ width: 3 }} />
                        <AppText style={{ color: this.state.autoSimilar ? 'white' : Theme.colors.palette.primary }} >Auto</AppText>
                    </View>
                    
                </TouchableOpacity>}


                
            </View>

            <HoverContextMenu 
                options={[
                    {
                        id: 'close',
                        name: 'Close'
                    }
                ]}
                headerComponent={() => {
                    if (!this.state.showInfoData) return null;

                    let tagObject = {}

                    this.state.showInfoData.tags.map((tag, index) => {
                        if (this.state.showInfoData?.figure?.hiddenTags?.includes(index)) {
                            return;
                        };
                        tagObject[index] = tag;
                    })

                    let feature = () => {
                        if (this.state.showInfoData.features) {
                            if (this.state.showInfoData.features.increasing) {
                                return trending('up', {}, 14);
                            } else if (this.state.showInfoData.features.decreasing) {
                                return trending('down', {}, 14);
                            } else if (this.state.showInfoData.features.hockeystick?.increasing) {
                                return trending('up', {}, 14, true);
                            } else if (this.state.showInfoData.features.hockeystick?.decreasing) {
                                return trending('down', {}, 14, true);
                            } else {
                                return null;
                            }
                        } else {
                            return null;
                        }
                    }

                    return <View style={{ alignItems: 'center', justifyContent: 'center', padding: 20, width: "100%" }} >
                        <AppText tag="h2" >{this.state.showInfoData.chartB ? "Correlation" : "Metric Info"}</AppText>

                        {!this.state.showInfoData.chartB && <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} >
                            {this.state.showInfoData.status === 'critical' && <AppText style={{ fontSize: 28, color: 'red' }} ><Ionicons name="warning" color="red" size={28} /> Hot</AppText>}

                            {this.state.showInfoData.status === 'warning' && <AppText style={{ fontSize: 28, color: '#ff8f17' }} ><Ionicons name="information-circle" color="#ff8f17" size={28} /> Warm</AppText>}

                            {this.state.showInfoData.status === 'normal' && <AppText style={{ fontSize: 28, color: 'green' }} ><Ionicons name="checkmark-circle" color="green" size={28} /> Cool</AppText>}

                            <View style={{ width: 10 }} />

                            {feature()}

                        </View>}

                        

                        <View style={{ borderWidth: this.state.showInfoData.status === 'critical' ? 6 : this.state.showInfoData.status === 'warning' ? 4 : 4, borderRadius: 10, marginTop: 10, marginBottom: 10, overflow: 'hidden', borderColor: this.state.showInfoData.chartB ? 'gray' : this.state.showInfoData.status === 'critical' ? 'red' : this.state.showInfoData.status === 'warning' ? '#ff8f17' : 'green' }} >
                            {!this.state.showInfoData.figure ? <ImageBackground source={{ uri: this.state.showInfoData.altImg || this.state.showInfoData.img }} style={{width: 400, height: 400, alignItems: 'center', justifyContent: 'center'}} imageStyle={{ opacity: 0.3 }} >
                                <Loading size={42} color={this.state.showInfoData.chartB ? 'gray' : this.state.showInfoData.status === 'critical' ? 'red' : this.state.showInfoData.status === 'warning' ? '#ff8f17' : 'green'} />
                            </ImageBackground> : <Plot {...this.state.showInfoData.figure} config={{ displaylogo: false }} onUpdate={event => {
                                if (this.state.tagDerivedFromId) return;
                                let hiddenTags = [];
                                if (event.data) {
                                    for (let plot of event.data) {
                                        if (!plot) continue;
                                        if (plot.visible === 'legendonly') {
                                            hiddenTags.push(Number(plot.name));
                                        }
                                    }
                                }

                                this.state.showInfoData.figure?.hiddenTags && JSON.stringify(this.state.showInfoData.figure.hiddenTags) !== JSON.stringify(hiddenTags) && this.state.showInfo && this.setState(update(this.state, { showInfoData: { figure: { hiddenTags: { $set: hiddenTags } } } }))

                            }}  />}
                        </View>

                        
                        

                        {!this.state.showInfoData.chartB && <View style={{ width: "100%" }}  >
                            <AppText >Metric:</AppText>
                            <View style={{ height: 5 }} />
                            <ScrollView horizontal={true} >
                                <AppText tag="pre" >{this.state.showInfoData.metric}</AppText>
                            </ScrollView>
                            <View style={{ height: 10 }} />
                            <AppText >Tags:</AppText>
                            <View style={{ height: 5 }} />
                            <ScrollView horizontal={true} contentContainerStyle={{ paddingBottom: 10 }} >
                                <AppText tag="pre" >{JSON.stringify(tagObject, null, 4)}</AppText>
                            </ScrollView>
                            <AppText >Stats:</AppText>
                            <View style={{ height: 5 }} />
                            <ScrollView horizontal={true} >
                                <AppText tag="pre" >{JSON.stringify(this.state.showInfoData.stats, null, 4)}</AppText>
                            </ScrollView>
                            <View style={{ height: 10 }} />
                            <AppText >Features:</AppText>
                            <View style={{ height: 5 }} />
                            <ScrollView horizontal={true} >
                                <AppText tag="pre" >{JSON.stringify(this.state.showInfoData.features, null, 4)}</AppText>
                            </ScrollView>
                            <View style={{ height: 10 }} />
                            <AppText >ID:</AppText>
                            <View style={{ height: 5 }} />
                            <AppText tag="pre" >{this.state.showInfoData.id}</AppText>
                            <View style={{ height: 10 }} />
                            
                            
                        </View>}
                        

                    
                        
                    </View>
                }}
                show={this.state.showInfo}
                onAction={action => {
                    this.setState(update(this.state, {showInfo: {$set: false}, returnToScatter: {$set: null}, tagDerivedFromId: {$set: false}}));
                }}
                refresh={this.state.showInfoRefresh}
                onLoad={async () => {

                    let figure;

                    console.log(this.state.showInfoData);

                    if (this.state.showInfoData.chartB) {

                        let figureA = await this.chartData.getChartFigure(this.state.showInfoData.id);
                        let figureB = await this.chartData.getChartFigure(this.state.showInfoData.chartB.id);

                        let figureATag = this.state.showInfoData.tag ?? 0;
                        let figureBTag = this.state.showInfoData.chartB.tag ?? 0;

                        let traceA = {
                            x: figureA.data[figureATag].y,
                            y: figureB.data[figureBTag].y,
                            mode: 'markers',
                            type: 'scatter',
                            marker: {
                                color: [...new Array(figureA.data[figureATag].y.length).keys()],
                                coloraxis: 'coloraxis',
                                symbol: 'circle'
                            },
                            name: "",
                            orientation: "v",
                            showlegend: false,
                        }

                        figure = {
                            data: [ traceA ],
                            layout: {
                                "autosize": false,
                                "coloraxis": {
                                    "colorbar": {
                                        "title": {
                                            "text": "color"
                                        }
                                    },
                                    "colorscale": [
                                        [
                                            0,
                                            "#0d0887"
                                        ],
                                        [
                                            0.1111111111111111,
                                            "#46039f"
                                        ],
                                        [
                                            0.2222222222222222,
                                            "#7201a8"
                                        ],
                                        [
                                            0.3333333333333333,
                                            "#9c179e"
                                        ],
                                        [
                                            0.4444444444444444,
                                            "#bd3786"
                                        ],
                                        [
                                            0.5555555555555556,
                                            "#d8576b"
                                        ],
                                        [
                                            0.6666666666666666,
                                            "#ed7953"
                                        ],
                                        [
                                            0.7777777777777778,
                                            "#fb9f3a"
                                        ],
                                        [
                                            0.8888888888888888,
                                            "#fdca26"
                                        ],
                                        [
                                            1,
                                            "#f0f921"
                                        ]
                                    ]
                                },
                                "font": {
                                    "size": 11
                                },
                                "height": 400,
                                "legend": {
                                    "tracegroupgap": 0
                                },
                                "showlegend": true,
                                "template": {},
                                "title": {
                                    "text": "Scatter",
                                    "x": 0.05,
                                    "xanchor": "left"
                                },
                                "width": 400,
                                "xaxis": {
                                    "title": {
                                        "text": figureA.layout.title.text
                                    }
                                },
                                "yaxis": {
                                    "title": {
                                        "text": figureB.layout.title.text
                                    }
                                }
                                
                            }
                        }

                        //delete figure.layout;


                    } else {
                        figure = await this.chartData.getChartFigure(this.state.showInfoData.id);
                    }

                    console.log("figure", figure);

                    



                    let tagDerivedFromId = false;

                    let tag = this.state.returnToScatter?.id.split(".").pop() || this.state.showInfoData?.tag;

                    if (this.state.showInfoData.chartB) {
                        tag = null;
                    }

                    if (this.state.showInfoData?.id.includes(".")) {
                        tag = this.state.showInfoData?.id?.split(".").pop();
                        tagDerivedFromId = true;
                    }

                    let hiddenTags = [];

                    if (tagDerivedFromId) {
                        for (let i=0; i<this.state.showInfoData.tags.length; i++) {
                            // != type insensitive
                            tag != i && hiddenTags.push(i);
                        }
                    } else if (tag) {
                        for (let i=0; i<figure.data.length; i++) {
                            if (i != tag) {
                                figure.data[i].visible="legendonly"
                                hiddenTags.push(i);
                            }
                        }
                    }

                    //figure.data[0].visible = 'legendonly';

                    //console.log(figure.data[0]);

                    //console.log("hidden tags", hiddenTags);

                    figure.hiddenTags = hiddenTags;

                    if (this.state.showInfo) {
                        this.setState(update(this.state, { showInfoData: { figure: {$set: figure} }, tagDerivedFromId: {$set: tagDerivedFromId} }));
                    }
                }}
                altClose={true}
                topLeft={() => {
                    if (this.state.showInfoData?.chartB) return null;
                    return <View style={{ paddingLeft: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} >
                        <TouchableOpacity onPress={async () => {

                            let metric = {...this.state.charts[this.state.showInfoData.id]};

                            if (!metric || (this.state.showInfoDataRefresh + 5000) > Date.now()) {
                                return;
                            };

                            metric.figure = await this.chartData.getChartFigure(this.state.showInfoData.id);
                            metric.id = this.state.showInfoData.id;

                            this.setState(update(this.state, { showInfoData: {$set: metric}, showInfoDataRefresh: {$set: Date.now()} }))

                        }} ><Ionicons name="reload-circle" color={Theme.colors.palette.primary} size={32} /></TouchableOpacity>

                        <TouchableOpacity disabled={this.state.showInfoData?.plot === 'scatter'} onPress={async () => {

                            this.setState(update(this.state, {showInfo: {$set: false}, autoSimilar: {$set: false}, showSimilarPanel: {$set: true}, similarMetrics: {[this.state.showInfoData.id]: {$set: { ts: Date.now() }}}}));

                            }} ><MaterialCommunityIcons name="chevron-double-right" size={32} color={this.state.showInfoData?.plot === 'scatter' ? 'gray' : Theme.colors.palette.primary} /> 
                        </TouchableOpacity>

                        {this.state.showInfoData?.prometheus && <TouchableOpacity style={{ marginLeft: 5 }} onPress={async () => {
                            Linking.openURL(this.state.showInfoData.prometheus.replace('host.docker.internal', 'localhost') + '&g0.tab=0&g0.range_input=3h');
                        }} >
                            <Prometheus fill={"purple"} width={28} height={28} />

                        </TouchableOpacity>}

                        {this.state.showInfoData?.grafana && <TouchableOpacity style={{ marginLeft: 5 }} onPress={async () => {
                            Linking.openURL(this.state.showInfoData.grafana.replace('host.docker.internal', 'localhost'));
                        }} >
                            <Grafana fill={"purple"} width={28} height={28} />

                        </TouchableOpacity>}
                        {this.state.showInfoData?.plot === 'scatter' && <TouchableOpacity disabled={!this.state.showInfoData?.figure} style={{ marginLeft: 10 }} onPress={async () => {

                            let properId = this.state.showInfoData.id.split('.')[0];

                            this.setState(update(this.state, { showInfo: {$set: true}, showInfoData: {$set: this.state.charts[properId]}, showInfoRefresh: {$set: String(Date.now())}, returnToScatter: {$set: {...this.state.showInfoData, figure: undefined}} }));

                            }} ><MaterialCommunityIcons name="chart-line" size={32} color={Theme.colors.palette.primary} />
                        </TouchableOpacity>}

                        {this.state.returnToScatter && <TouchableOpacity disabled={!this.state.showInfoData?.figure} style={{ marginLeft: 10 }} onPress={async () => {

                            this.setState(update(this.state, { showInfo: {$set: true}, showInfoData: {$set: this.state.returnToScatter}, showInfoRefresh: {$set: String(Date.now())}, returnToScatter: {$set: null} }));

                            }} ><MaterialCommunityIcons name="chart-scatter-plot" size={32} color={Theme.colors.palette.primary} /> 
                        </TouchableOpacity>}
                    </View>
                }}
            />

            <HoverContextMenu 
                options={[
                    {
                        id: 'close',
                        name: 'Close'
                    }
                ]}
                headerComponent={() => {
                    return <View style={{ alignItems: 'center', justifyContent: 'center', padding: 20, width: "100%" }} >
                        <AppText tag="h2" >Info</AppText>
                        <View style={{ height: 5 }} />
                        <AppText tag="h3" >A/B : C/D &middot; <AppText tag="h3" style={{ borderWidth: 2, borderColor: Theme.colors.palette.primary, borderRadius: 9999, paddingLeft: 7, paddingRight: 8, color: Theme.colors.palette.primary }} >E</AppText> &middot; F<AppText>s</AppText></AppText>
                        <View style={{ height: 5 }} />
                        <AppText tag="body" style={{ margin: 5 }} ><AppText style={{ fontWeight: 'bold' }} >A:</AppText> Number of metrics on screen</AppText>
                        <AppText tag="body" style={{ margin: 5 }} ><AppText style={{ fontWeight: 'bold' }} >B:</AppText> Number of available metrics</AppText>
                        <AppText tag="body" style={{ margin: 5 }} ><AppText style={{ fontWeight: 'bold' }} >C:</AppText> Number of processed metrics</AppText>
                        <AppText tag="body" style={{ margin: 5 }} ><AppText style={{ fontWeight: 'bold' }} >D:</AppText> Number of metrics in the server</AppText>
                        <AppText tag="body" style={{ margin: 5 }} ><AppText style={{ fontWeight: 'bold' }} >E:</AppText> Time till next cycle</AppText>
                        <AppText tag="body" style={{ margin: 5 }} ><AppText style={{ fontWeight: 'bold' }} >F:</AppText> Elapsed time of last metric collection</AppText>
                        
                    </View>
                }}
                show={this.state.showHudInfo}
                onAction={action => {
                    this.setState(update(this.state, {showHudInfo: {$set: false}}));
                }}
            />
            
            
        </View>
    }

    similarListEmptyComponent = () => {

        return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', top: 200, padding: 10}} >
            {this.state.autoSimilar ? <Ionicons name="search" size={48} color="gray" /> : <MaterialCommunityIcons name="chevron-double-right" size={64} color="gray" />}
            <AppText tag="h3" style={{ color: 'gray' }} >{this.state.autoSimilar ? 'Similar metrics will show here' : "Select metrics to find ones similar to it"}</AppText>
        </View>

    }

    emptyComponent = () => {
        if (this.state.forceLoading) {
            return <View style={{ flexDirection: 'row', flexWrap: 'wrap' }} >
                {this.state.numberOfSentinels.map((config, index) => {
                    return <Animatable.View
                        key={String(index)}
                        animation={{0: {opacity: 0.2}, [config.peak]: {opacity: 1}, 1: {opacity: 0.2}}} 
                        iterationCount="infinite" 
                        duration={config.duration}
                        style={{width: 150, height: 150, backgroundColor: "#d7d7d7", margin: 5, borderRadius: 10, borderWidth: config.borderWidth, borderColor: "#d7d7d7"}} 
                />})}
            </View>
        } else {
            return <View style={{ alignItems: 'center', marginTop: 20 }} >
                <AppText tag="h4" style={{ alignSelf: 'center' }} >No metrics to display{this.state.metricFilter.length ? ' for this filter' : ''}</AppText>
                <View style={{ height: 10 }} />

                <Button name={"Change the metric type"} icon={{name: "swap-horizontal"}} onPress={() => {
                    this.metricTypeDropdownRef.current?.toggle();
                }} />

                <View style={{ height: 10 }} />

                <Button name={"Change the number of metrics"} icon={{name: "albums-outline"}} onPress={() => {
                    this.metricNumberDropdownRef.current?.toggle();
                }} />

                <View style={{ height: 10 }} />

                <Button name={"Refresh the metrics"} icon={{name: "reload"}} onPress={() => {
                    this.setState(update(this.state, { forceLoading: {$set: true} }), async () => {
                        await this.chartData.setMetricType(this.state.metricType, this.state.chartLimit);
                    })
                }} />

            </View>
        }
    }

    render = () => {

        let similarMetrics = this.state.autoSimilar ? this.state.autoSimilarCharts : ObjectSort(this.state.similarMetrics, 'ts', 'desc')


        return <View style={{ height: Dimensions.get('window').height }}>

            <View style={{ height: "18%" }} >
                {this.headerComponent()}
            </View>
            <View style={{ height: "82%", flexDirection: 'row' }} >
                <FlatList
                    key={String(this.state.showSimilarPanel + this.state.mainSplit)}
                    keyExtractor={i => i.id}
                    data={this.state.renderCharts.charts}
                    renderItem={this.renderChartItem}
                    numColumns={this.state.showSimilarPanel ? Math.round(this.state.mainSplit / 150) - 1 : 8}
                    ListEmptyComponent={this.emptyComponent}
                    removeClippedSubviews={true}
                    windowSize={1}
                    initialNumToRender={0}
                    maxToRenderPerBatch={1}
                    style={{ width: this.state.showSimilarPanel ? this.state.mainSplit : "100%" }}
                    getItemLayout={(data, index) => (
                        {length: 150, offset: 150 * index, index}
                    )}
                />
                <FlatList
                    data={similarMetrics}
                    renderItem={this.renderSimilarItem}
                    removeClippedSubviews={true}
                    windowSize={2}
                    ListEmptyComponent={this.similarListEmptyComponent}
                    style={{ display: this.state.showSimilarPanel ? 'flex' : 'none', width: Dimensions.get('window').width - this.state.mainSplit, borderLeftWidth: 2, borderLeftColor: Theme.colors.palette.primary }}
                    keyExtractor={i => i.id}
                />
                {this.state.showSimilarPanel && <View style={{ position: 'absolute', top: 0, left: this.state.mainSplit + 5, backgroundColor: 'white', borderRadius: 10 }} >
                    <TouchableOpacity onPress={() => {
                        this.setState(update(this.state, { mainSplit: {$set: this.state.mainSplit - (this.state.mainSplit > 450 ? 170 : 0)} }))
                    }} >
                        <Ionicons name="chevron-back" color="gray" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        this.setState(update(this.state, { mainSplit: {$set: this.state.mainSplit + (this.state.mainSplit <= 1050 ? 170 : 0)} }))
                    }} >
                        <Ionicons name="chevron-forward" color="gray" size={20} />
                    </TouchableOpacity>
                </View>}
                
            </View>
            
            
        </View>

        
        
    }

}

export default Home;

