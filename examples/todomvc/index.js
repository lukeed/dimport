import { html, Component } from 'https://unpkg.com/htm/preact/standalone.mjs'
import css from 'https://unpkg.com/csz@1.0.0/index.js';
import clsx from 'https://unpkg.com/clsx?module';

const styles = css`/todomvc/index.css`;

const isMatch = (x, y) => x === y ? 'selected' : '';
const toKey = ev => ev.target.closest('li').getAttribute('data-id');

function toFilter() {
	let x = location.hash.split('/').pop();
	return !!FILTERS[x] ? x : 'all';
}

const FILTERS = {
	all: () => true,
	active: x => !x.completed,
	completed: x => x.completed
};

export default class TodoMVC extends Component {
	constructor() {
		super();

		this.state = {
			todos: [],
			isEditing: null,
			filter: toFilter()
		};

		this.onKeydown = ev => {
			if (ev.keyCode !== 13) return;
			ev.preventDefault();

			let val = ev.target.value.trim();
			if (val) {
				ev.target.value = '';
				this.setState({
					todos: this.state.todos.concat({
						key: Math.random().toString(36).substring(4),
						title: val,
						completed: false,
					})
				});
			}
		};

		this.onToggleAll = ev => {
			let bool = ev.target.checked;
			this.setState({
				todos: this.state.todos.map(x => {
					x.completed = bool;
					return x;
				})
			});
		};

		this.onToggle = ev => {
			let key = toKey(ev);
			this.setState({
				todos: this.state.todos.map(x => {
					if (x.key === key) x.completed = !x.completed;
					return x;
				})
			});
		};

		this.onDelete = ev => {
			let key = toKey(ev);
			this.setState({
				todos: this.state.todos.filter(x => x.key !== key)
			});
		};

		this.onEdit = ev => {
			this.setState({
				isEditing: toKey(ev)
			});
		};

		this.onEditKeys = ev => {
			if (ev.which === 27) {
				this.onCancel(ev);
			} else if (ev.which === 13) {
				ev.target.value.trim() ? this.onSave(ev) : this.onDelete(ev);
			}
		}

		this.onSave = ev => {
			let key = toKey(ev);
			this.setState({
				isEditing: null,
				todos: this.state.todos.map(x => {
					if (x.key === key) x.title = ev.target.value.trim();
					return x;
				})
			});
		};

		this.onCancel = () => {
			this.setState({
				isEditing: null
			});
		};

		this.onClear = () => {
			this.setState({
				todos: this.state.todos.filter(FILTERS.active)
			});
		};

		this.setNode = elem => {
			this.edit = elem;
		}

		addEventListener('hashchange', () => {
			this.setState({ filter: toFilter() });
		});
	}

	componentDidUpdate(_, old) {
		let now = this.state.isEditing;
		if (now && this.edit && old !== now) {
			this.edit.focus();
		}
	}

	render(_, state) {
		const todos = state.todos;
		const visibles = state.todos.filter(FILTERS[state.filter]);
		const numActive = state.todos.filter(FILTERS.active).length;
		const numComplete = todos.length - numActive;

		const isSelected = isMatch.bind(isMatch, state.filter);

		return html`
			<div class=${clsx('todoapp', styles)}>
				<header class="header">
					<h1>todos</h1>
					<input autofocus class="new-todo"
						placeholder="What needs to be done?"
						onkeydown=${this.onKeydown} />
				</header>

				${
					todos.length
					? html`
						<section class="main">
							<input id="toggle-all" class="toggle-all" type="checkbox"
								onchange=${this.onToggleAll} checked=${numActive === 0} />
							<label for="toggle-all">Mark all as complete</label>
							<ul class="todo-list">
								${
									visibles.map(obj => {
										let isEditing = obj.key === state.isEditing;
										let classname = clsx({ editing:isEditing, completed:obj.completed });
										return html`
											<li key=${obj.key} data-id=${obj.key} class=${classname}>
												<div class="view">
													<input class="toggle" type="checkbox"
														checked=${obj.completed} onchange=${this.onToggle} />
													<label ondblclick=${this.onEdit}>${obj.title}</label>
													<button class="destroy" onclick=${this.onDelete} />
												</div>
												${
													isEditing
													? html`
														<input ref=${this.setNode}
															class="edit" defaultValue=${obj.title}
															onblur=${this.onCancel} onkeydown=${this.onEditKeys} />`
													: null
												}
											</li>
										`;
									})
								}
							</ul>
						</section>
					` : null
				}

				${
					(numActive || numComplete)
					? html`
						<footer class="footer">
							<span class="todo-count"><strong>${numActive}</strong> ${numActive > 1 ? 'items' : 'item'} left</span>
							<ul class="filters">
								<li><a href="#/" class=${isSelected('all')}>All</a></li>
								<li><a href="#/active" class=${isSelected('active')}>Active</a></li>
								<li><a href="#/completed" class=${isSelected('completed')}>Completed</a></li>
							</ul>
							${
								numComplete
								? html`<button class="clear-completed" onClick=${this.onClear}>Clear completed</button>`
								: null
							}
						</footer>`
					: null
				}
			</div>
		`;
	}
}
