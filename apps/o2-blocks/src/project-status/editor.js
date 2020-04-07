/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { CustomSelectControl, PanelBody, TextControl } from '@wordpress/components';
import { withSelect } from '@wordpress/data';

import './editor.scss';

const edit = args => {
	const { attributes, setAttributes } = args;
	const { estimate, team, allTasks, pendingTasks, completedTasks } = attributes;

	[ 'allTasks', 'pendingTasks', 'completedTasks' ].forEach( task => {
		if ( attributes[ task ] !== args[ `${ task }Live` ] ) {
			setAttributes( {
				[ task ]: args[ `${ task }Live` ],
			} );
		}
	} );

	const estimates = [
		{
			key: '',
			name: '---',
		},
		{
			key: '1-week',
			name: '1 week',
		},
		{
			key: '2-weeks',
			name: '2 weeks',
		},
		{
			key: '3-weeks',
			name: '3 weeks',
		},
	];

	const completedPercentage = Math.round( ( completedTasks * 100 ) / allTasks );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Project Settings' ) }>
					<TextControl
						label={ __( 'Team Assignment' ) }
						value={ team }
						onChange={ value => setAttributes( { team: value } ) }
					/>
					<CustomSelectControl
						label={ __( 'Time Estimate' ) }
						options={ estimates }
						value={ estimates.find( option => option.key === estimate ) || estimates[ 0 ] }
						onChange={ value => setAttributes( { estimate: value.selectedItem.key } ) }
					/>
				</PanelBody>
			</InspectorControls>
			<section className="wp-block-project-status__header">
				<h1 className="wp-block-project-status__title">Project Overview</h1>
				<div className="wp-block-project-status__counts">
					<strong className="wp-block-project-status__total">{ allTasks } Tasks</strong>
					{ '\u2003' }
					<span>
						{ completedTasks } Completed ({ completedPercentage }%)
					</span>
					{ '\u2003' }
					<span>{ pendingTasks } In progress</span>
				</div>
			</section>
			<div className="wp-block-project-status__bar">
				<span className="if-missing-style">Completed Tasks</span>
				<span
					style={ {
						display: 'block',
						width: `${ Math.round( ( completedTasks * 730 ) / allTasks ) }px`,
						background: '#22DE84',
						height: '18px',
					} }
				/>
				<span
					className="if-missing-style"
					style={ {
						display: 'block',
						width: `${ Math.round( 730 * ( 1 - pendingTasks / allTasks ) ) }px`,
						background: '#207c3e',
						height: '3px',
					} }
				/>
				<span className="if-missing-style">In-progress Tasks</span>
				<span
					style={ {
						display: 'block',
						width: `${ Math.round( ( pendingTasks * 730 ) / allTasks ) }px`,
						background: '#D6F3E3',
						height: '18px',
					} }
				/>
				<span
					className="if-missing-style"
					style={ {
						display: 'block',
						width: `${ Math.round( 730 * ( 1 - completedTasks / allTasks ) ) }px`,
						background: '#8aa192',
						height: '3px',
					} }
				/>
			</div>
			{ ( estimate || team ) && (
				<div className="wp-block-project-status__footer">
					{ team && <span className="wp-block-project-status__team">{ 'Team ' + team }</span> }
					{ estimate && (
						<span className="wp-block-project-status__estimate">
							{ estimate && estimates.find( option => option.key === estimate ).name }
						</span>
					) }
				</div>
			) }
		</>
	);
};

export default withSelect( select => {
	const tasks = select( 'core/block-editor' )
		.getBlocks()
		.filter( block => {
			return block.name === 'a8c/task';
		} );

	return {
		allTasksLive: tasks.length,
		completedTasksLive: tasks.filter( task => task.attributes.status === 'done' ).length,
		pendingTasksLive: tasks.filter( task => task.attributes.status === 'in-progress' ).length,
	};
} )( edit );
