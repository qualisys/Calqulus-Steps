export class ProcessingError extends Error {
	constructor(message, public code?) {
		super(message);
		
		this.name = 'ProcessingError';
	}
  }