import { html, Component, render } from 'https://unpkg.com/htm/preact/standalone.mjs'

function hasDynamics() {
	try {
		new Function('import("foo")');
		return true;
	} catch (err) {
		return false;
	}
}

function Supports(props) {
	return html`
		<aside class="supports">
			<p>Supports static <code>import</code> statements? <span>${props.statics}</span></p>
			<p>Supports dynamic <code>import()</code> statements? <span>${props.dynamics}</span></p>
		</aside>
	`;
}

class App extends Component {
	constructor() {
		super();

		this.state = {
			statics: null,
			dynamics: null,
			loading: false,
			TodoMVC: null
		};

		this.load = ev => {
			ev.preventDefault();
			this.setState({ loading:true });
			import('./todomvc/index.js').then(m => {
				this.setState({
					loading: false,
					TodoMVC: m.default
				})
			});
		};
	}

	componentWillMount() {
		const x = document.createElement('script');

		this.setState({
			statics: String(x.noModule !== void 0),
			dynamics: String(hasDynamics())
		});
	}

	render(_, state) {
		let cls = 'btn';
		if (state.loading) {
			cls += ' loading';
		}
		return html`
			<div class="app">
				<${Supports} statics=${state.statics} dynamics=${state.dynamics} />

				<main>
					${
						state.TodoMVC
							? html`<${state.TodoMVC} />`
							: html`
								<button class="btn" onclick=${this.load}>
									${ state.loading ? html`<span/>` : 'Load TodoMVC' }
								</button>`
					}
				</main>
			</div>
		`;
	}
}

render(
	html`<${App} page="All" />`,
	document.body
);
