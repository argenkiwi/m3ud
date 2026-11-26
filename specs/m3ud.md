# Program Specifications

This program downloads audio files specified in an M3U playlist. It takes an M3U file path as a command-line argument, optionally resolves khinsider URLs to direct download links, then downloads all files to a local folder.

## Nodes

### Check M3U File
- Initial node of the application.
- Reads the file path from the first command-line argument.
- If no path is provided, or if the path does not have a `.m3u` extension, or if the file does not exist or is not a regular file, it records and prints the error, then terminates; the program exits with status 1.
- If valid, it stores the path in state and transitions to `READ_M3U_FILE`.

### Read M3U File
- Reads the M3U file at the stored path.
- Parses each line, ignoring empty lines and comment lines (starting with `#`).
- Stores the extracted URLs in state and prints them.
- If any URL starts with `https://downloads.khinsider.com/game-soundtracks`, it transitions to `PROMPT_RESOLVE`.
- Otherwise, it transitions to `PROMPT_DOWNLOAD`.

### Prompt Resolve
- Displays: `Some URLs require resolution. Proceed? (y/n)`.
- Asks again until the user enters `y`/`yes` or `n`/`no`; end of input counts as `n`.
- If `y`/`yes`, it transitions to `RESOLVE_URLS`.
- If `n`/`no`, it terminates.

### Resolve URLs
- Replaces each khinsider URL with the direct download link found on its track page; other URLs are kept as they are.
- All resolutions run in parallel.
- Stores the resolved URLs in state and transitions to `SAVE_M3U_FILE`.

### Save M3U File
- Overwrites the original playlist with the resolved URLs, one per line.
- Prints the saved file path and the URL list.
- Transitions to `PROMPT_DOWNLOAD`.

### Prompt Download
- Displays: `Proceed with download? (y/n)`.
- Asks again until the user enters `y`/`yes` or `n`/`no`; end of input counts as `n`.
- If `y`/`yes`, it transitions to `DOWNLOAD_FILES`.
- If `n`/`no`, it terminates.

### Download Files
- Creates an output folder next to the playlist, named after the playlist without its extension.
- Downloads all URLs into the output folder in parallel.
- Removes the original playlist.
- Points the stored path at `<output folder>/playlist.m3u` and replaces the URLs with `file://` URIs of the downloaded files.
- Transitions to `SAVE_LOCAL_M3U_FILE`.

### Save Local M3U File
- The same step as Save M3U File, writing the local playlist of downloaded files.
- Prints the saved file path and the URL list, then terminates.

## Shared State

The shared state consists of:
- `m3uFilePath`: The path to the M3U file being processed.
- `urls`: The list of URLs extracted from or written to the M3U file.
- `error`: Why the program stopped, if it stopped because the playlist argument was invalid; empty otherwise.